import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { modifiesSelection } from '../utils/step-checker';

export default class EditorPluginsArticleCardComponent extends Component {
  @tracked isOutsideArticle = true;
  @tracked articleUri = undefined;
  @tracked canMoveUp = false;
  @tracked canMoveDown = false;

  constructor() {
    super(...arguments);
    this.args.controller.addTransactionStepListener(this.onTransactionUpdate);
  }

  willDestroy() {
    this.args.controller.removeTransactionStepListener(
      this.onTransactionUpdate
    );
    super.willDestroy();
  }

  @action
  moveArticle(moveUp) {
    this.args.controller.perform((tr) => {
      tr.commands.moveArticle({
        controller: this.args.controller,
        articleUri: this.articleUri,
        moveUp,
      });
    });
  }

  @action
  removeArticle() {
    this.args.controller.perform((tr) => {
      tr.commands.deleteNodeFromUri({
        uri: this.articleUri,
        type: 'article',
      });
    });
  }

  onTransactionUpdate = (transaction, steps) => {
    if (modifiesSelection(steps) && transaction.currentSelection.lastRange) {
      const limitedDatastore = transaction
        .getCurrentDataStore()
        .limitToRange(transaction.currentSelection.lastRange, 'rangeIsInside');

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
        this.canMoveUp = transaction.commands.moveArticle.canExecute({
          controller: this.args.controller,
          articleUri: this.articleUri,
          moveUp: true,
        });
        this.canMoveDown = transaction.commands.moveArticle.canExecute({
          controller: this.args.controller,
          articleUri: this.articleUri,
          moveUp: false,
        });
      }
    }
  };
}
