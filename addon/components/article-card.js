import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ParserN3 from '@rdfjs/parser-n3';
import SHACLValidator from 'rdf-validate-shacl';
import factory from 'rdf-ext';
import { Readable } from 'stream-browserify';
import process from 'process';

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
      moveUp,
      this.args.widgetArgs.options
    );
  }

  @action
  async removeArticle() {
    /*this.args.controller.executeCommand(
      'delete-node-from-uri',
      this.args.controller,
      this.articleUri,
      'article',
      this.args.widgetArgs.options
    );*/
    console.log(process);
    window.process = process;
    const s = new Readable();
    s._read = () => {}; // redundant? see update below
    s.push(`
    @prefix sh: <http://www.w3.org/ns/shacl#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix schema: <http://schema.org/> .
    schema:ArticleShape
      a sh:NodeShape  ;
      sh:targetSubjectsOf <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>;
      sh:property [
                sh:path <https://say.data.gift/ns/hasPart> ;
                sh:class <http://data.vlaanderen.be/ns/besluit#Artikel>
      ];
      sh:property [
        sh:path <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ;
        sh:hasValue <https://say.data.gift/ns/Chapter>
      ].`);
    s.push(null);
    const parser = new ParserN3({ factory });
    const shapes = await factory.dataset().import(parser.import(s));
    console.log(shapes);
    const data = this.args.controller.datastore._dataset;
    console.log(data);
    const validator = new SHACLValidator(shapes, { factory });
    const report = await validator.validate(data);
    console.log(report);
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
