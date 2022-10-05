import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class EditorPluginsArticleCardComponent extends Component {
  @tracked isOutsideArticle = true;
  @tracked articleUri = undefined;
  @tracked canMoveUp = false;
  @tracked canMoveDown = false;

  constructor() {
    super(...arguments);
    this.args.controller.onEvent(
      'selectionChanged',
      this.selectionChangedHandler
    );
  }

  @action
  moveArticle(moveUp) {
    this.args.controller.executeCommand(
      'move-article',
      this.args.controller,
      this.articleUri,
      moveUp
    );
  }

  @action
  removeArticle() {
    this.args.controller.executeCommand(
      'delete-node-from-uri',
      this.args.controller,
      this.articleUri,
      'article'
    );
  }

  @action
  selectionChangedHandler() {
    const currentSelection = this.args.controller.selection.lastRange;
    if (!currentSelection) {
      return;
    }
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      currentSelection,
      'rangeIsInside'
    );

    const article = limitedDatastore
      .match(null, 'a', '>https://say.data.gift/ns/Article')
      .asQuads()
      .next().value;
    if (!article) {
      this.isOutsideArticle = true;
      this.articleUri = undefined;
    } else {
      this.isOutsideArticle = false;
      this.articleUri = article.subject.value;
      this.canMoveUp = this.args.controller.canExecuteCommand(
        'move-article',
        this.args.controller,
        this.articleUri,
        true
      );
      this.canMoveDown = this.args.controller.canExecuteCommand(
        'move-article',
        this.args.controller,
        this.articleUri,
        false
      );
    }
  }
}
