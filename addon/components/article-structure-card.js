import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import searchForType from '../utils/searchForType';
import { inject as service } from '@ember/service';

export default class EditorPluginsArticleStructureCardComponent extends Component {
  @tracked isOutsideArticle = true;
  @tracked articleUri = undefined;
  @tracked isOutsideStructure = true;
  @tracked structureUri = undefined;
  @tracked structures = [];
  @service intl;

  constructor() {
    super(...arguments);
    this.args.controller.onEvent(
      'selectionChanged',
      this.selectionChangedHandler
    );
    this.checkStructures = this.checkStructures.bind(this);
  }

  @action
  insertArticle() {
    if (this.articleUri) {
      this.args.controller.executeCommand(
        'insert-article-below',
        this.args.controller,
        this.articleUri,
        undefined,
        this.args.widgetArgs.options
      );
    } else {
      this.args.controller.executeCommand(
        'insert-article',
        this.args.controller,
        undefined,
        this.args.widgetArgs.options
      );
    }
  }

  @action
  insertParagraph() {
    this.args.controller.executeCommand(
      'insert-paragraph',
      this.args.controller,
      this.paragraphUri,
      this.articleUri,
      this.args.widgetArgs.options
    );
  }

  @action
  insertStructure(structureName) {
    this.args.controller.executeCommand(
      'insert-article-structure',
      this.args.controller,
      structureName,
      this.args.widgetArgs.options,
      this.intl
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
    const options = this.args.widgetArgs.options;
    const article = limitedDatastore
      .match(null, 'a', `>${options.articleType}`)
      .asQuads()
      .next().value;
    if (!article) {
      this.isOutsideArticle = true;
      this.articleUri = undefined;
    } else {
      this.isOutsideArticle = false;
      this.articleUri = article.subject.value;
    }

    const paragrah = limitedDatastore
      .match(null, 'a', '>https://say.data.gift/ns/Paragraph')
      .asQuads()
      .next().value;
    if (!paragrah) {
      this.paragraphUri = undefined;
    } else {
      this.paragraphUri = paragrah.subject.value;
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
    this.checkStructures(this.args.widgetArgs.options);
  }
  checkStructures(options) {
    const newStructures = [...options.structures];
    newStructures[0].disabled = false;
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      this.args.controller.selection.lastRange,
      'rangeIsInside'
    );
    for (let i = 1; i < options.structures.length; i++) {
      const parentType = searchForType(
        this.args.controller.datastore,
        limitedDatastore,
        options.structures[i - 1].type
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
