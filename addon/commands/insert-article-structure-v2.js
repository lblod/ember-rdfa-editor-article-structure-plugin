import { v4 as uuid } from 'uuid';
import searchForType from '../utils/searchForType';
import searchForSuperStructure from '../utils/searchForSuperStructure';
import romanize from '../utils/romanize';
import ParserN3 from '@rdfjs/parser-n3';
import SHACLValidator from 'rdf-validate-shacl';
import factory from 'rdf-ext';
import { Readable } from 'stream-browserify';
import process from 'process';

export default class InsertArticleStructureV2Command {
  name = 'insert-article-structure-v2';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  async execute(controller, structureName, options, intlService) {
    console.log(structureName);
    const structureToAddIndex = options.structures.findIndex(
      (structure) => structure.title === structureName
    );
    const structureToAdd = options.structures[structureToAddIndex];
    const structureUri = `${structureToAdd.uriBase}${uuid()}`;
    const shaclConstraint = structureToAdd.shaclConstraint;
    window.process = process;
    const s = new Readable();
    s._read = () => {}; // redundant? see update below
    s.push(shaclConstraint);
    s.push(null);
    const parser = new ParserN3({ factory });
    const shapes = await factory.dataset().import(parser.import(s));
    console.log(shapes);
    const data = controller.datastore._dataset;
    console.log(data);
    const validator = new SHACLValidator(shapes, { factory });
    const report = await validator.validate(data);
    const urisNotAllowedToInsert = report.results.map(
      (result) => result.focusNode.value
    );
    const treeWalker = new controller.treeWalkerFactory({
      root: controller.modelRoot,
      start: controller.selection.lastRange._start.parentElement,
      end: controller.modelRoot,
      reverse: false,
      visitParentUpwards: true,
      filter: (node) => {
        const nodeUri = node.getAttribute('resource');
        if (nodeUri && !urisNotAllowedToInsert.includes(nodeUri)) {
          return 0;
        }
        return 1;
      },
    });
    const resourceToInsert = treeWalker.nextNode();
    const resourceToInsertUri = resourceToInsert.getAttribute('resource');
    console.log(resourceToInsertUri)
    console.log(structureToAdd.insertPredicate)
    const nodeToInsertPredicateNodes = controller.datastore
      .match(
        `>${resourceToInsertUri}`,
        `>${structureToAdd.insertPredicate}`,
        null
      )
      .asPredicateNodes().next().value;
    console.log(nodeToInsertPredicateNodes)
    console.log(controller.datastore._dataset)
    const nodeToInsert = [...nodeToInsertPredicateNodes.nodes][0];
    const structureHtml = structureToAdd.template(structureUri);
    controller.executeCommand(
      'insert-html',
      structureHtml,
      controller.rangeFactory.fromInNode(
        nodeToInsert,
        0,
        nodeToInsert.getMaxOffset()
      )
    );
  }
}
