import { v4 as uuid } from 'uuid';
import { STRUCTURES } from '../utils/constants';

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
    const limitedDatastore = controller.datastore.limitToRange(
      controller.selection.lastRange,
      'rangeIsInside'
    );
    const structureOfSameType = limitedDatastore
      .match(null, 'a', `>${structureToAdd.type}`)
      .asSubjectNodes()
      .next().value;
    console.log(structureOfSameType);
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
      console.log('parent structure type');
      const parentStructureType = parentStructure
        ? parentStructure.type
        : undefined;
      console.log(parentStructureType);
      const parentStructureObjectNode = limitedDatastore
        .match(null, 'a', `>${parentStructureType}`)
        .asSubjectNodes()
        .next().value;
      let containerNode;
      if (parentStructure && parentStructureObjectNode) {
        //In the parent structure
        containerNode = [...parentStructureObjectNode.nodes][0];
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
      console.log(containerNode);
      const children = [...containerNode.children];
      const structureNode = controller.createModelElement('div');
      const rangeToInsert = controller.rangeFactory.fromInNode(
        containerNode,
        0,
        containerNode.getMaxOffset()
      );
      const structureUri = 'uriToTest';
      structureNode.setAttribute('property', 'ext:hasStructure');
      structureNode.setAttribute('typeof', structureToAdd.type);
      structureNode.setAttribute('resource', structureUri);
      this.model.change((mutator) => {
        mutator.insertNodes(rangeToInsert, structureNode);
      });
      const rangeToInsertChildrens = controller.rangeFactory.fromInNode(
        structureNode,
        0,
        structureNode.getMaxOffset()
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
      const parentStructureObjectNode = limitedDatastore
        .match(null, 'a', `>${parentStructureType}`)
        .asSubjectNodes()
        .next().value;
      if (parentStructure && parentStructureObjectNode) {
        // Added to the parent structure
        const parentStructureElement = [...parentStructureObjectNode.nodes][0];
        const rangeToInsert = controller.rangeFactory.fromInNode(
          parentStructureElement,
          parentStructureElement.getMaxOffset(),
          parentStructureElement.getMaxOffset()
        );
        const structureUri = 'uriToTest';
        const structureHtml = `
        <div property="ext:hasStructure" typeof="${structureToAdd.type}" resource="${structureUri}">
          ${structureToAdd.title}
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
        const structureUri = 'uriToTest';
        const structureHtml = `
        <div property="ext:hasStructure" typeof="${structureToAdd.type}" resource="${structureUri}">
          ${structureToAdd.title}
        </div>
      `;
        controller.executeCommand('insert-html', structureHtml, rangeToInsert);
      }
    }
  }
}
