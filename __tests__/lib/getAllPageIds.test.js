jest.mock('@/blog.config', () => ({
  NOTION_INDEX: 0
}))

import getAllPageIds from '@/lib/db/notion/getAllPageIds'

describe('getAllPageIds', () => {
  test('falls back to page_sort when collection_query is empty', () => {
    const collectionQuery = {}
    const collectionId = 'collection-1'
    const collectionView = {
      'view-1': {
        value: {
          page_sort: ['page-a', 'page-b']
        }
      }
    }
    const viewIds = ['view-1']

    expect(
      getAllPageIds(collectionQuery, collectionId, collectionView, viewIds)
    ).toEqual(['page-a', 'page-b'])
  })
})
