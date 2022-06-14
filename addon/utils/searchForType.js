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

export default searchForType;