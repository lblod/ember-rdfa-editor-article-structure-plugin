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
    const structureUri = `${structureToAdd.uriBase}${uuid()}`;
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
      console.log('needs to wrap everything');
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
      console.log(parentStructureObjectNode);
      let containerNode;
      if (parentStructure && parentStructureObjectNode) {
        console.log('In the parent structure');
        //In the parent structure
        const parentNode = [...parentStructureObjectNode.nodes][0];
        for (let child of parentNode.children) {
          if (child.attributeMap.get('property') === 'ext:content') {
            containerNode = child;
            break;
          }
        }
      } else {
        console.log('In the article container');
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
      structureNode.setAttribute('property', 'ext:hasStructure');
      structureNode.setAttribute('typeof', structureToAdd.type);
      structureNode.setAttribute('resource', structureUri);
      const structureContent = controller.createModelElement('div');
      structureContent.setAttribute('property', 'ext:content');
      this.model.change((mutator) => {
        mutator.insertNodes(rangeToInsert, structureNode);
      });
      //TODO: make this with model elements if possible
      const titleHtml = `
        <span property="dct:title">${structureToAdd.title}</span>
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
      const parentStructureObjectNode = limitedDatastore
        .match(null, 'a', `>${parentStructureType}`)
        .asSubjectNodes()
        .next().value;
      if (parentStructure && parentStructureObjectNode) {
        // Added to the parent structure
        const parentNode = [...parentStructureObjectNode.nodes][0];
        let contentNode;
        for (let child of parentNode.children) {
          if (child.attributeMap.get('property') === 'ext:content') {
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
        <div property="ext:hasStructure" typeof="${structureToAdd.type}" resource="${structureUri}">
          <span property="dct:title">${structureToAdd.title}</span>
          <div property="ext:content">
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
        <div property="ext:hasStructure" typeof="${structureToAdd.type}" resource="${structureUri}">
          <span property="dct:title">${structureToAdd.title}</span>
          <div property="ext:content">
            <span class="mark-highlight-manual">Voer inhoud in</span>
          </div>
        </div>
      `;
        controller.executeCommand('insert-html', structureHtml, rangeToInsert);
      }
    }
  }
}
