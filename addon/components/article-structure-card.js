import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { STRUCTURES } from '../utils/constants';
import searchForType from '../utils/searchForType';

export default class EditorPluginsTemplateVariableCardComponent extends Component {
  @tracked isOutsideArticle = true;
  @tracked articleUri = undefined;
  @tracked structures = [];

  constructor() {
    super(...arguments);
    this.args.controller.onEvent(
      'selectionChanged',
      this.selectionChangedHandler
    );
    this.checkStructures = this.checkStructures.bind(this);
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
  moveArticle(moveUp) {
    this.args.controller.executeCommand(
      'move-article',
      this.args.controller,
      this.articleUri,
      moveUp
    );
  }

  @action
  insertStructure(structureName) {
    this.args.controller.executeCommand(
      'insert-article-structure',
      this.args.controller,
      structureName
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
    this.checkStructures();
  }
  checkStructures() {
    const newStructures = [...STRUCTURES];
    newStructures[0].disabled = false;
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      this.args.controller.selection.lastRange,
      'rangeIsInside'
    );
    for (let i = 1; i < STRUCTURES.length; i++) {
      console.log('searching for')
      console.log(STRUCTURES[i - 1].type);
      const parentType = searchForType(
        this.args.controller.datastore,
        limitedDatastore,
        STRUCTURES[i - 1].type
      );
      console.log(parentType)
      if (parentType) {
        newStructures[i].disabled = false;
      } else {
        newStructures[i].disabled = true;
      }
    }
    this.structures = newStructures;
  }
}
