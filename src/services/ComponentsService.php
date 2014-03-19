<?php
namespace Craft;

/**
 *
 */
class ComponentsService extends BaseApplicationComponent
{
	/**
	 * @var array The types of components supported by Craft.
	 */
	public $types;

	/**
	 * @access private
	 * @var array The internal list of components
	 */
	private $_components;

	/**
	 * Returns instances of a component type, indexed by their class handles.
	 *
	 * @param string $type
	 * @return array
	 */
	public function getComponentsByType($type)
	{
		if (!isset($this->_components[$type]))
		{
			$this->_components[$type] = $this->_findComponentsByType($type);
		}

		return $this->_components[$type];
	}

	/**
	 * Returns a new component instance by its type and class.
	 *
	 * @param string $type
	 * @param string $class
	 * @return BaseComponentType|null
	 */
	public function getComponentByTypeAndClass($type, $class)
	{
		// Make sure this is a valid component type
		if (!isset($this->types[$type]))
		{
			$this->_noComponentTypeExists($type);
		}

		// Add the class suffix, initialize, and return
		$fullClass = $class.$this->types[$type]['suffix'];
		$nsClass = __NAMESPACE__.'\\'.$fullClass;

		if (!class_exists($nsClass))
		{
			// Maybe it's a plugin component?
			if (($pos = strpos($class, '_')) !== false)
			{
				$pluginHandle = substr($class, 0, $pos);
			}
			else
			{
				$pluginHandle = $class;
			}

			$plugin = craft()->plugins->getPlugin($pluginHandle);

			if (!$plugin || !craft()->plugins->doesPluginClassExist($plugin, $this->types[$type]['subfolder'], $fullClass))
			{
				return null;
			}
		}

		return $this->initializeComponent($fullClass, $this->types[$type]['instanceof']);
	}

	/**
	 * Populates a new component instance by its type and model.
	 *
	 * @param string $type
	 * @param BaseComponentModel $model
	 * @return BaseComponentType|null
	 */
	public function populateComponentByTypeAndModel($type, BaseComponentModel $model)
	{
		$component = $this->getComponentByTypeAndClass($type, $model->type);

		if ($component)
		{
			$component->model = $model;

			if ($model->settings)
			{
				$component->setSettings($model->settings);
			}

			if ($model->hasSettingErrors())
			{
				$component->getSettings()->addErrors($model->getSettingErrors());
			}

			return $component;
		}
	}

	/**
	 * Making sure a class exists and it's not abstract or an interface.
	 *
	 * @param string $class
	 * @return bool
	 */
	public function validateClass($class)
	{
		// Add the namespace
		$class = __NAMESPACE__.'\\'.$class;

		// Make sure the class exists
		if (!class_exists($class))
		{
			return false;
		}

		// Make sure this isn't an abstract class or interface
		$ref = new \ReflectionClass($class);

		if ($ref->isAbstract() || $ref->isInterface())
		{
			return false;
		}

		return true;
	}

	/**
	 * Validates a class and creates an instance of it.
	 *
	 * @param string $class
	 * @param string $instanceOf
	 * @return mixed
	 */
	public function initializeComponent($class, $instanceOf = null)
	{
		// Validate the class first
		if (!$this->validateClass($class))
		{
			return;
		}

		// Instantiate it
		$class = __NAMESPACE__.'\\'.$class;
		$component = new $class;

		// Make sure it extends the right base class or implements the correct interface
		if ($instanceOf)
		{
			// Add the namespace
			$instanceOf = __NAMESPACE__.'\\'.$instanceOf;

			if (!($component instanceof $instanceOf))
			{
				return;
			}
		}

		// All good. Call the component's init() method and return it.
		$component->init();
		return $component;
	}

	/**
	 * Finds all of the components by a given type.
	 *
	 * @param string $type
	 * @return array
	 */
	private function _findComponentsByType($type)
	{
		if (!isset($this->types[$type]))
		{
			$this->_noComponentTypeExists($type);
		}

		$componentClasses = array();

		// Find all of the built-in components
		$filter = $this->types[$type]['suffix'].'\.php$';
		$files = IOHelper::getFolderContents(craft()->path->getAppPath().$this->types[$type]['subfolder'], false, $filter);

		if ($files)
		{
			foreach ($files as $file)
			{
				$componentClasses[] = IOHelper::getFileName($file, false);
			}
		}

		// Now load any plugin-supplied components
		foreach (craft()->plugins->getPlugins() as $plugin)
		{
			$pluginClasses = craft()->plugins->getPluginClasses($plugin, $this->types[$type]['subfolder'], $this->types[$type]['suffix']);
			$componentClasses = array_merge($componentClasses, $pluginClasses);
		}

		// Initialize, verify, and save them
		$components = array();
		$names = array();

		foreach ($componentClasses as $class)
		{
			$component = $this->initializeComponent($class, $this->types[$type]['instanceof']);

			if ($component && $component->isSelectable())
			{
				// Save it
				$classHandle = $component->getClassHandle();
				$components[$classHandle] = $component;
				$names[] = $component->getName();
			}
		}

		// Now sort all the components by their name
		array_multisort($names, $components);

		return $components;
	}

	/**
	 * Throws a "no component type exists" exception.
	 *
	 * @access private
	 * @param string $type
	 * @throws Exception
	 */
	private function _noComponentTypeExists($type)
	{
		throw new Exception(Craft::t('No component type exists by the name “{type}”', array('type' => $type)));
	}
}
