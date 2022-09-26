import { STRUCTURES, structureTypes } from '../utils/constants';

export default class MoveStructureCommand {
  canExecute(state, { controller, structureUri, moveUp }) {
    const structureSubjectNode = state.datastore
      .match(`>${structureUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    const structureNode = [...structureSubjectNode.nodes][0];
    const structureContainer = structureNode.parent;
    const structures = structureContainer.children.filter(
      (child) => child.modelNodeType === 'ELEMENT'
    );
    const structureIndex = structures.findIndex(
      (structure) => structure === structureNode
    );
    if (
      ((structureIndex !== 0 && moveUp) ||
        (structureIndex !== structures.length - 1 && !moveUp)) &&
      structures.length > 1
    ) {
      return true;
    } else {
      const currentStructureType = state.datastore
        .match(`>${structureUri}`, 'a', null)
        .asQuads()
        .next().value.object.value;
      const currentStructureIndex = STRUCTURES.findIndex(
        (structure) => structure.type === currentStructureType
      );
      const parentStructure = STRUCTURES[currentStructureIndex - 1];
      if (!parentStructure) {
        return false;
      }
      const treeWalker = new controller.treeWalkerFactory({
        root: state.document,
        start: structureNode,
        end: state.document,
        reverse: moveUp,
        filter: (node) => {
          const isStructure = structureTypes.includes(
            node.getAttribute('typeof')
          );
          if (isStructure) {
            const structureType = node.getAttribute('typeof');
            if (structureType === parentStructure.type) {
              return 0; // We accept the result
            }
          }
          return 1; // We skip this node
        },
      });
      const nodeToInsert = treeWalker.nextNode();
      if (nodeToInsert) {
        return true;
      } else {
        return false;
      }
    }
  }

  execute({ transaction }, { controller, structureUri, moveUp }) {
    let structureSubjectNode = transaction
      .getCurrentDataStore()
      .match(`>${structureUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    let structureNode = [...structureSubjectNode.nodes][0];
    let structureContainer = structureNode.parent;
    const structures = structureContainer.children.filter(
      (child) => child.modelNodeType === 'ELEMENT'
    );
    const structureIndex = structures.findIndex(
      (structure) => structure === structureNode
    );
    const currentStructureType = transaction
      .getCurrentDataStore()
      .match(`>${structureUri}`, 'a', null)
      .asQuads()
      .next().value.object.value;
    if (
      ((structureIndex !== 0 && moveUp) ||
        (structureIndex !== structures.length - 1 && !moveUp)) &&
      structures.length > 1
    ) {
      const structureA = structures[structureIndex];
      const bIndex = moveUp ? structureIndex - 1 : structureIndex + 1;
      const structureB = structures[bIndex];

      const structureARange =
        transaction.rangeFactory.fromAroundNode(structureA);
      const structureBRange =
        transaction.rangeFactory.fromAroundNode(structureB);
      const structureAToInsert = structureA.clone();
      const structureBToInsert = structureB.clone();
      transaction.insertNodes(structureBRange, structureAToInsert);
      transaction.insertNodes(structureARange, structureBToInsert);
      transaction.commands['recalculate-structure-numbers']({
        container: structureAToInsert.parent,
        type: currentStructureType,
      });
      transaction.commands['recalculate-article-numbers']();
      const heading = structureAToInsert.children.find(
        (child) => child.getAttribute('property') === 'say:heading'
      );
      const range = transaction.rangeFactory.fromInElement(heading, 0, 0);
      transaction.selectRange(range);
    } else {
      // Find next parent structure up the chain
      const currentStructureIndex = STRUCTURES.findIndex(
        (structure) => structure.type === currentStructureType
      );
      const parentStructure = STRUCTURES[currentStructureIndex - 1];
      const treeWalker = new controller.treeWalkerFactory({
        root: transaction.currentDocument,
        start: structureNode,
        end: transaction.currentDocument,
        reverse: moveUp,
        filter: (node) => {
          const isStructure = structureTypes.includes(
            node.getAttribute('typeof')
          );
          if (isStructure) {
            const structureType = node.getAttribute('typeof');
            if (structureType === parentStructure.type) {
              return 0; // We accept the result
            }
          }
          return 1; // We skip this node
        },
      });
      const nodeToInsert = treeWalker.nextNode();
      if (nodeToInsert) {
        //Insert structure last place in that structure
        const structureContent = nodeToInsert.children.filter(
          (child) => child.getAttribute('property') === 'say:body'
        )[0];
        let insertRange;
        if (
          structureContent.children.length === 1 &&
          structureContent.children[0].getAttribute('class') ===
            'mark-highlight-manual'
        ) {
          insertRange = transaction.rangeFactory.fromInNode(
            structureContent,
            0,
            structureContent.getMaxOffset()
          );
        } else {
          insertRange = transaction.rangeFactory.fromInNode(
            structureContent,
            structureContent.getMaxOffset(),
            structureContent.getMaxOffset()
          );
        }
        const originalContainer = structureNode.parent;
        const insertStructure = structureNode.clone();
        transaction.insertNodes(insertRange, insertStructure);
        transaction.deleteNode(structureNode);
        if (originalContainer.children.length === 0) {
          transaction.commands.insertHtml({
            htmlString:
              '<span class="mark-highlight-manual">Voer inhoud in</span>',
            range: transaction.rangeFactory.fromInNode(
              originalContainer,
              0,
              originalContainer.getMaxOffset()
            ),
          });
        }
        transaction.commands['recalculate-structure-numbers']({});
        transaction.commands['recalculate-structure-numbers']({
          container: structureContainer,
          type: currentStructureType,
        });
        transaction.commands['recalculate-structure-numbers']({
          container: structureContent,
          type: currentStructureType,
        });
        transaction.commands['recalculate-article-numbers']();
        const heading = insertStructure.children.find(
          (child) => child.getAttribute('property') === 'say:heading'
        );
        const range = transaction.rangeFactory.fromInElement(heading, 0, 0);
        transaction.selectRange(range);
      }
    }
  }
}
