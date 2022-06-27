import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class EditorPluginsParagraphCardComponent extends Component {
  @tracked isOutsideArticle = true;
  @tracked articleUri = undefined;

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
  selectionChangedHandler() {
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      this.args.controller.selection.lastRange,
      'rangeIsInside'
    );

    const article = limitedDatastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
      .asQuads()
      .next().value;
    if (!article) {
      this.isOutsideArticle = true;
      this.articleUri = undefined;
    } else {
      this.isOutsideArticle = false;
      this.articleUri = article.subject.value;
    }
  }
}
