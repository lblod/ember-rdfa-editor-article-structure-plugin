import DeleteNodeFromUriCommand from './commands/delete-node-from-uri-command';
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
  get name() {
    return 'article-structure';
  }

  initialize(transaction, controller, options) {
    transaction.registerCommand('insertArticle', new InsertArticleCommand());
    transaction.registerCommand(
      'insertParagraph',
      new InsertParagraphCommand()
    );
    transaction.registerCommand(
      'insertArticleStructure',
      new InsertArticleStructureCommand()
    );
    transaction.registerCommand('moveArticle', new MoveArticleCommand());
    transaction.registerCommand('moveParagraph', new MoveParagraphCommand());
    transaction.registerCommand('moveStructure', new MoveStructureCommand());
    transaction.registerCommand(
      'deleteNodeFromUri',
      new DeleteNodeFromUriCommand()
    );
    transaction.registerCommand(
      'recalculate-article-numbers',
      new RecalculateArticleNumbersCommand()
    );

    transaction.registerCommand(
      'recalculate-paragraph-numbers',
      new RecalculateParagraphNumbersCommand()
    );

    transaction.registerCommand(
      'recalculate-structure-numbers',
      new RecalculateStructureNumbersCommand()
    );

    transaction.registerWidget(
      {
        componentName: 'article-structure-card',
        identifier: 'article-structure-plugin/card',
        desiredLocation: 'insertSidebar',
        widgetArgs: {
          options: options,
        },
      },
      controller
    );
    transaction.registerWidget(
      {
        componentName: 'paragraph-card',
        identifier: 'article-structure-plugin/paragraph-card',
        desiredLocation: 'sidebar',
      },
      controller
    );
    transaction.registerWidget(
      {
        componentName: 'article-card',
        identifier: 'article-structure-plugin/article-card',
        desiredLocation: 'sidebar',
      },
      controller
    );
    transaction.registerWidget(
      {
        componentName: 'structure-card',
        identifier: 'article-structure-plugin/structure-card',
        desiredLocation: 'sidebar',
      },
      controller
    );
    this.options = options;
  }
}
