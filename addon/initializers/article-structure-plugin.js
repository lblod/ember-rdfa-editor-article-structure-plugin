import ArticleStructurePlugin from '../article-structure-plugin';

function pluginFactory(plugin) {
  return {
    create: (initializers) => {
      const pluginInstance = new plugin();
      Object.assign(pluginInstance, initializers);
      return pluginInstance;
    },
  };
}

export function initialize(application) {
  application.register(
    'plugin:article-structure',
    pluginFactory(ArticleStructurePlugin),
    {
      singleton: false,
    }
  );
}

export default {
  initialize,
};
