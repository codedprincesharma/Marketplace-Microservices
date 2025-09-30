class MockImageKit {
  constructor() { }
  upload({ file, fileName }) {
    return Promise.resolve({
      url: `https://imagekit.example.com/${fileName}`,
      thumbnailUrl: `https://imagekit.example.com/thumbnails/${fileName}`,
      fileId: 'mock-file-id',
      file_id: 'mock-file-id',
      id: 'mock-file-id'
    });
  }
}

module.exports = MockImageKit;