import BLOG from "@/blog.config"

function appendIds(target, ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return
  }
  for (const id of ids) {
    target.push(id)
  }
}

function getIdsFromCollectionQueryView(view) {
  return (
    view?.collection_group_results?.blockIds ||
    view?.blockIds ||
    []
  )
}

function getIdsFromCollectionView(view) {
  const value = view?.value || view
  return (
    value?.page_sort ||
    value?.query2?.result?.blockIds ||
    value?.query?.result?.blockIds ||
    []
  )
}

export default function getAllPageIds(collectionQuery, collectionId, collectionView, viewIds) {
  if (!collectionQuery && !collectionView) {
    return []
  }
  let pageIds = []
  let selectedIds = []
  try {
    // Notion数据库中的第几个视图用于站点展示和排序：
    const groupIndex = BLOG.NOTION_INDEX || 0
    if (viewIds && viewIds.length > 0) {
      const selectedViewId = viewIds[groupIndex]
      selectedIds = getIdsFromCollectionQueryView(
        collectionQuery?.[collectionId]?.[selectedViewId]
      )
      if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
        selectedIds = getIdsFromCollectionView(collectionView?.[selectedViewId])
      }
      appendIds(pageIds, selectedIds)
    }
  } catch (error) {
    console.error('Error fetching page IDs:', {
      collectionId,
      viewId: viewIds?.[BLOG.NOTION_INDEX || 0],
      selectedCount: Array.isArray(selectedIds) ? selectedIds.length : 0,
      error
    })
    return []
  }

  // 否则按照数据库原始排序
  if (pageIds.length === 0 && collectionQuery && Object.values(collectionQuery).length > 0) {
    const pageSet = new Set()
    Object.values(collectionQuery[collectionId]).forEach(view => {
      view?.blockIds?.forEach(id => pageSet.add(id)) // group视图
      view?.collection_group_results?.blockIds?.forEach(id => pageSet.add(id)) // table视图
    })
    pageIds = [...pageSet]
    // console.log('PageIds: 从collectionQuery获取', collectionQuery, pageIds.length)
  }

  if (pageIds.length === 0 && collectionView && Object.values(collectionView).length > 0) {
    const pageSet = new Set()
    Object.values(collectionView).forEach(view => {
      getIdsFromCollectionView(view).forEach(id => pageSet.add(id))
    })
    pageIds = [...pageSet]
  }
  return pageIds
}
