test('filterJobs retorna solo jobs que cumplen todos los criterios', () => {
  const result = filterJobs(mockJobs, { selectedModalities: new Set(['Remoto']) });
  expect(result.every(j => j.attributes.modality === 'Remoto')).toBe(true);
});