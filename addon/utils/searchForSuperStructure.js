function searchForSuperStructure(limitedDatastore, childIndex, structureTypes) {
  for (let i = childIndex - 1; i >= 0; i--) {
    const structureType = structureTypes[i];
    const structure = limitedDatastore
      .match(null, 'a', `>${structureType}`)
      .asSubjectNodes()
      .next().value;
    if (structure) {
      return structure;
    }
  }
}

export default searchForSuperStructure;
