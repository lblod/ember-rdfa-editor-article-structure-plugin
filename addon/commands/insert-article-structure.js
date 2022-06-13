import { v4 as uuid } from 'uuid';
import { STRUCTURES } from '../utils/constants';

function searchForType(generalDatastore, limitedDatastore, type) {
  return limitedDatastore
    .match(null, 'a', null)
    .transformDataset((dataset) => {
      return dataset.filter((quad) => {
        const match = generalDatastore
          .match(`>${quad.subject.value}`, 'dct:type', `>${type}`)
          .asSubjectNodes()
          .next().value;
        return Boolean(match);
      });
    })
    .asSubjectNodes()
    .next().value;
}

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
        <span property="say:heading">${structureToAdd.title}</span>
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
          if (child.attributeMap.get('property') === 'say:body') {
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
          <span property="say:heading">${structureToAdd.title}</span>
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
          <span property="say:heading">${structureToAdd.title}</span>
          <div property="say:body" datatype='rdf:XMLLiteral'>
            <span class="mark-highlight-manual">Voer inhoud in</span>
          </div>
        </div>
      `;
        controller.executeCommand('insert-html', structureHtml, rangeToInsert);
      }
    }
  }
}
