import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { STRUCTURES } from '../utils/constants';
import searchForType from '../utils/searchForType';
import { modifiesSelection } from '../utils/step-checker';

export default class EditorPluginsArticleStructureCardComponent extends Component {
  @tracked isOutsideArticle = true;
  @tracked articleUri = undefined;
  @tracked isOutsideStructure = true;
  @tracked structureUri = undefined;
  @tracked structures = [];

  constructor() {
    super(...arguments);
    this.args.controller.addTransactionStepListener(this.onTransactionUpdate);
    this.checkStructures = this.checkStructures.bind(this);
  }

  @action
  insertArticle() {
    this.args.controller.perform((tr) => {
      tr.commands.insertArticle({
        controller: this.args.controller,
        articleContent: undefined,
        options: this.args.widgetArgs.options,
      });
    });
  }

  @action
  insertParagraph() {
    this.args.controller.perform((tr) => {
      tr.commands.insertParagraph({
        articleUri: this.articleUri,
      });
    });
  }

  @action
  insertStructure(structureName) {
    this.args.controller.perform((tr) => {
      tr.commands.insertArticleStructure({
        controller: this.args.controller,
        structureName,
        options: this.args.widgetArgs.options,
      });
    });
  }

  @action
  onTransactionUpdate(transaction, steps) {
    if (modifiesSelection(steps)) {
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
      }
      const documentMatches = limitedDatastore
        .match(null, 'a', '>https://say.data.gift/ns/DocumentSubdivision')
        .asPredicateNodeMapping()
        .single();
      if (
        documentMatches &&
        documentMatches.nodes &&
        documentMatches.nodes.length
      ) {
        const structure = documentMatches.nodes.pop();
        if (!structure) {
          this.isOutsideStructure = true;
          this.structureUri = undefined;
        } else {
          this.isOutsideStructure = false;
          this.structureUri = structure.getAttribute('resource');
        }
      }
      this.checkStructures(transaction);
    }
  }

  checkStructures(transaction) {
    const newStructures = [...STRUCTURES];
    newStructures[0].disabled = false;
    const limitedDatastore = transaction
      .getCurrentDataStore()
      .limitToRange(transaction.currentSelection.lastRange, 'rangeIsInside');
    for (let i = 1; i < STRUCTURES.length; i++) {
      const parentType = searchForType(
        transaction.getCurrentDataStore(),
        limitedDatastore,
        STRUCTURES[i - 1].type
      );
      if (parentType) {
        newStructures[i].disabled = false;
      } else {
        newStructures[i].disabled = true;
      }
    }
    this.structures = newStructures;
  }
}
