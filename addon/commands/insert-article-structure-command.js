import { v4 as uuid } from 'uuid';
import { STRUCTURES } from '../utils/constants';
import searchForType from '../utils/searchForType';
import romanize from '../utils/romanize';

export default class InsertArticleStructureCommand {
  name = 'insert-article-structure';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, structureName) {
    const structureToAddIndex = STRUCTURES.findIndex(
      (structure) => structure.title === structureName
    );
    const structureToAdd = STRUCTURES[structureToAddIndex];
    const structureUri = `${structureToAdd.uriBase}${uuid()}`;
    const limitedDatastore = controller.datastore.limitToRange(
      controller.selection.lastRange,
      'rangeIsInside'
    );
    const structureOfSameType = searchForType(
      controller.datastore,
      limitedDatastore,
      structureToAdd.type
    );
    const besluit = limitedDatastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
      .asSubjectNodes()
      .next().value;
    const besluitNode = [...besluit.nodes][0];
    let articleContainerNode;
    for (let child of besluitNode.children) {
      if (child.attributeMap.get('property') === 'prov:value') {
        articleContainerNode = child;
        break;
      }
    }
    if (!structureOfSameType) {
      // Needs to wrap everything
      const parentStructure = STRUCTURES[structureToAddIndex - 1];
      const parentStructureType = parentStructure
        ? parentStructure.type
        : undefined;
      const parentStructureObjectNode = searchForType(
        controller.datastore,
        limitedDatastore,
        parentStructureType
      );
      let containerNode;
      if (parentStructure && parentStructureObjectNode) {
        //In the parent structure
        const parentNode = [...parentStructureObjectNode.nodes][0];
        for (let child of parentNode.children) {
          if (child.attributeMap.get('property') === 'say:body') {
            containerNode = child;
            break;
          }
        }
      } else {
        //In the article container
        const besluit = limitedDatastore
          .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
          .asSubjectNodes()
          .next().value;
        const besluitNode = [...besluit.nodes][0];
        for (let child of besluitNode.children) {
          if (child.attributeMap.get('property') === 'prov:value') {
            containerNode = child;
            break;
          }
        }
      }
      const children = [...containerNode.children];
      const structureNode = controller.createModelElement('div');
      const rangeToInsert = controller.rangeFactory.fromInNode(
        containerNode,
        0,
        containerNode.getMaxOffset()
      );
      structureNode.setAttribute('property', 'say:hasPart');
      structureNode.setAttribute('typeof', 'say:DocumentSubdivision');
      structureNode.setAttribute('resource', structureUri);
      const structureContent = controller.createModelElement('div');
      structureContent.setAttribute('property', 'say:body');
      structureContent.setAttribute('datatype', 'rdf:XMLLiteral');
      this.model.change((mutator) => {
        mutator.insertNodes(rangeToInsert, structureNode);
      });
      //TODO: make this with model elements if possible
      const titleHtml = `
        <span property="dct:type" resource="${structureToAdd.type}"></span>
        <${structureToAdd.heading} property="say:heading">
          <span property="eli:number" datatype="xsd:string">I</span>.
          <span property="ext:title"><span class="mark-highlight-manual">Voer inhoud in</span></span>
        </${structureToAdd.heading}>
      `;
      controller.executeCommand(
        'insert-html',
        titleHtml,
        controller.rangeFactory.fromInNode(
          structureNode,
          0,
          structureNode.getMaxOffset()
        )
      );
      const rangeToInsertContent = controller.rangeFactory.fromInNode(
        structureNode,
        structureNode.getMaxOffset(),
        structureNode.getMaxOffset()
      );
      this.model.change((mutator) => {
        mutator.insertNodes(rangeToInsertContent, structureContent);
      });
      const rangeToInsertChildrens = controller.rangeFactory.fromInNode(
        structureContent,
        0,
        structureContent.getMaxOffset()
      );
      this.model.change((mutator) => {
        mutator.insertNodes(rangeToInsertChildrens, ...children);
      });
    } else {
      // Needs to be added at the end
      const parentStructure = STRUCTURES[structureToAddIndex - 1];
      const parentStructureType = parentStructure
        ? parentStructure.type
        : undefined;
      const parentStructureObjectNode = searchForType(
        controller.datastore,
        limitedDatastore,
        parentStructureType
      );
      if (parentStructure && parentStructureObjectNode) {
        // Added to the parent structure
        const parentNode = [...parentStructureObjectNode.nodes][0];
        let contentNode;
        for (let child of parentNode.children) {
          if (child.getAttribute('property') === 'say:body') {
            contentNode = child;
            break;
          }
        }
        const rangeToInsert = controller.rangeFactory.fromInNode(
          contentNode,
          contentNode.getMaxOffset(),
          contentNode.getMaxOffset()
        );
        const structureHtml = `
        <div property="say:hasPart" typeof="say:DocumentSubdivision" resource="${structureUri}">
          <span property="dct:type" resource="${structureToAdd.type}"></span>
          <${structureToAdd.heading} property="say:heading">
            <span property="eli:number" datatype="xsd:string">
              ${this.generateStructureNumber(contentNode)}
            </span>
            :
            <span property="ext:title"><span class="mark-highlight-manual">Voer inhoud in</span></span>
          </${structureToAdd.heading}>
          <div property="say:body" datatype='rdf:XMLLiteral'>
            <span class="mark-highlight-manual">Voer inhoud in</span>
          </div>
        </div>
      `;
        controller.executeCommand('insert-html', structureHtml, rangeToInsert);
      } else {
        //Added to the article container
        const rangeToInsert = controller.rangeFactory.fromInNode(
          articleContainerNode,
          articleContainerNode.getMaxOffset(),
          articleContainerNode.getMaxOffset()
        );
        const structureHtml = `
        <div property="say:hasPart" typeof="say:DocumentSubdivision" resource="${structureUri}">
          <span property="dct:type" resource="${structureToAdd.type}"></span>
          <${structureToAdd.heading} property="say:heading">
            <span property="eli:number" datatype="xsd:string">
              ${this.generateStructureNumber(articleContainerNode)}
            </span>
            :
            <span property="ext:title"><span class="mark-highlight-manual">Voer inhoud in</span></span>
          </${structureToAdd.heading}>
          <div property="say:body" datatype='rdf:XMLLiteral'>
            <span class="mark-highlight-manual">Voer inhoud in</span>
          </div>
        </div>
      `;
        controller.executeCommand('insert-html', structureHtml, rangeToInsert);
      }
    }
    const titleNode = controller.datastore
      .match(`>${structureUri}`, 'ext:title', null)
      .asPredicateNodeMapping()
      .single().nodes[0];
    this.model.change(() => {
      const range = controller.rangeFactory.fromInElement(
        titleNode,
        0,
        titleNode.getMaxOffset()
      );
      controller.selection.selectRange(range);
    });
  }
  generateStructureNumber(container) {
    const substructures = container.children.filter(
      (node) => node.getAttribute('typeof') === 'say:DocumentSubdivision'
    );
    return romanize(substructures.length + 1);
  }
}
