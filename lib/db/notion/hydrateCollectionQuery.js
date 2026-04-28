import notionAPI from './getNotionAPI'

function unwrapCollectionView(view) {
  return view?.value?.value || view?.value || view || null
}

function hasQueryResults(query) {
  return Boolean(
    query?.collection_group_results?.blockIds?.length ||
      query?.blockIds?.length
  )
}

function mergeRecordMap(target, incoming) {
  if (!incoming) return target

  return {
    block: Object.assign({}, target.block, incoming.block),
    collection: Object.assign({}, target.collection, incoming.collection),
    collection_view: Object.assign(
      {},
      target.collection_view,
      incoming.collection_view
    ),
    notion_user: Object.assign({}, target.notion_user, incoming.notion_user)
  }
}

export default async function hydrateCollectionQuery({
  collectionId,
  collectionQuery,
  collectionView,
  viewIds,
  spaceId = null,
  from = 'collection-query'
}) {
  let nextCollectionQuery = collectionQuery || {}
  let mergedRecordMap = {
    block: {},
    collection: {},
    collection_view: {},
    notion_user: {}
  }

  if (!collectionId || !Array.isArray(viewIds) || viewIds.length === 0) {
    return { collectionQuery: nextCollectionQuery, recordMap: mergedRecordMap }
  }

  for (const viewId of viewIds) {
    if (hasQueryResults(nextCollectionQuery?.[collectionId]?.[viewId])) {
      continue
    }

    const currentView = unwrapCollectionView(collectionView?.[viewId])
    if (!currentView) {
      continue
    }

    try {
      console.log(
        '[API-->>请求]',
        `from:${from}`,
        `collection:${collectionId}`,
        `view:${viewId}`
      )
      const start = Date.now()
      const collectionData = await notionAPI.__call(
        'getCollectionData',
        collectionId,
        viewId,
        currentView,
        {
          limit: 999,
          spaceId: spaceId || undefined
        }
      )
      const end = Date.now()
      console.log(
        '[API<<--响应]',
        `耗时:${end - start}ms - from:${from}`,
        `collection:${collectionId}`,
        `view:${viewId}`
      )

      nextCollectionQuery = Object.assign({}, nextCollectionQuery, {
        [collectionId]: Object.assign({}, nextCollectionQuery?.[collectionId], {
          [viewId]: collectionData?.result?.reducerResults || {}
        })
      })
      mergedRecordMap = mergeRecordMap(mergedRecordMap, collectionData?.recordMap)
    } catch (error) {
      console.warn(
        '[Notion collection query fallback failed]',
        { collectionId, viewId, from },
        error
      )
    }
  }

  return { collectionQuery: nextCollectionQuery, recordMap: mergedRecordMap }
}
