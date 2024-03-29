import DeleteNodeFromUriCommand from './commands/delete-node-from-uri-command';
import InsertArticleBelowCommand from './commands/insert-article-below-command';
import InsertArticleCommand from './commands/insert-article-command';
import InsertArticleStructureCommand from './commands/insert-article-structure-command';
import InsertParagraphCommand from './commands/insert-paragraph-command';
import MoveArticleCommand from './commands/move-article-command';
import MoveParagraphCommand from './commands/move-paragraph-command';
import MoveStructureCommand from './commands/move-structure-command';
import RecalculateArticleNumbersCommand from './commands/recalculate-article-numbers-command';
import RecalculateParagraphNumbersCommand from './commands/recalculate-paragraph-numbers-command';
import RecalculateStructureNumbersCommand from './commands/recalculate-structure-numbers-command';

/**
 * Entry point for ArticleStructurePlugin
 *
 * @module ember-rdfa-editor-article-structure-plugin
 * @class ArticleStructurePlugin
 * @constructor
 * @extends EmberService
 */
export default class ArticleStructurePlugin {
  /**
   * Handles the incoming events from the editor dispatcher.  Responsible for generating hint cards.
   *
   * @method execute
   *
   * @param {string} hrId Unique identifier of the state in the HintsRegistry.  Allows the
   * HintsRegistry to update absolute selected regions based on what a user has entered in between.
   * @param {Array} rdfaBlocks Set of logical blobs of content which may have changed.  Each blob is
   * either has a different semantic meaning, or is logically separated (eg: a separate list item).
   * @param {Object} hintsRegistry Keeps track of where hints are positioned in the editor.
   * @param {Object} editor Your public interface through which you can alter the document.
   *
   * @public
   */
  controller;

  get name() {
    return 'article-structure';
  }

  initialize(controller, options) {
    this.controller = controller;
    controller.registerCommand(
      new InsertArticleCommand(controller._rawEditor._model)
    );
    controller.registerCommand(
      new InsertArticleBelowCommand(controller._rawEditor._model)
    );
    controller.registerCommand(
      new InsertParagraphCommand(controller._rawEditor._model)
    );
    controller.registerCommand(
      new InsertArticleStructureCommand(controller._rawEditor._model)
    );
    controller.registerCommand(
      new MoveArticleCommand(controller._rawEditor._model)
    );
    controller.registerCommand(
      new RecalculateArticleNumbersCommand(controller._rawEditor._model)
    );
    controller.registerCommand(
      new MoveParagraphCommand(controller._rawEditor._model)
    );
    controller.registerCommand(
      new RecalculateParagraphNumbersCommand(controller._rawEditor._model)
    );
    controller.registerCommand(
      new MoveStructureCommand(controller._rawEditor._model)
    );
    controller.registerCommand(
      new RecalculateStructureNumbersCommand(controller._rawEditor._model)
    );
    controller.registerCommand(
      new DeleteNodeFromUriCommand(controller._rawEditor._model)
    );
    controller.registerWidget({
      componentName: 'article-structure-card',
      identifier: 'article-structure-plugin/card',
      desiredLocation: 'insertSidebar',
      widgetArgs: {
        options: options,
      },
    });
    controller.registerWidget({
      componentName: 'paragraph-card',
      identifier: 'article-structure-plugin/paragraph-card',
      desiredLocation: 'sidebar',
    });
    controller.registerWidget({
      componentName: 'article-card',
      identifier: 'article-structure-plugin/article-card',
      desiredLocation: 'sidebar',
    });
    controller.registerWidget({
      componentName: 'structure-card',
      identifier: 'article-structure-plugin/structure-card',
      desiredLocation: 'sidebar',
    });
    this.options = options;
  }
}
