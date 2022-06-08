import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class EditorPluginsTemplateVariableCardComponent extends Component {
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
  insertParagraph() {
    this.args.controller.executeCommand(
      'insert-paragraph',
      this.args.controller,
      this.articleUri
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
