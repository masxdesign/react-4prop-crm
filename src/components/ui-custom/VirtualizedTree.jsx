import { useState, useRef, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronRight, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Flattens tree data into a list of visible nodes based on expanded state
 * Adds ancestry path to each node for traceability
 */
function flattenTree(items, expandedIds, depth = 0, ancestry = []) {
  const result = [];

  items.forEach((item) => {
    const nodeAncestry = [...ancestry, { id: item.id, name: item.name, depth }];
    const path = nodeAncestry.map((a) => a.id).join('/');
    result.push({ ...item, depth, path, ancestry: nodeAncestry });

    if (item.children && expandedIds.has(item.id)) {
      result.push(...flattenTree(item.children, expandedIds, depth + 1, nodeAncestry));
    }
  });

  return result;
}

/**
 * Collects all folder IDs from tree
 */
function getAllFolderIds(items) {
  const ids = [];
  items.forEach((item) => {
    if (item.children) {
      ids.push(item.id);
      ids.push(...getAllFolderIds(item.children));
    }
  });
  return ids;
}

/**
 * Collects all leaf (street) IDs from a subtree
 */
function getAllLeafIds(item) {
  if (!item.children || item.children.length === 0) {
    return [item.id];
  }
  return item.children.flatMap((child) => getAllLeafIds(child));
}

/**
 * Collects leaf IDs from a specific child matching a predicate
 */
function getLeafIdsFromMatchingChild(item, childMatcher) {
  if (!item.children) return [];

  const matchingChild = item.children.find(childMatcher);
  if (matchingChild) {
    return getAllLeafIds(matchingChild);
  }
  return [];
}

/**
 * Filters tree by search query, keeping parent structure
 */
function filterTree(items, query) {
  if (!query.trim()) return { items, expandedIds: new Set() };

  const searchLower = query.toLowerCase();
  const expandedIds = new Set();

  const itemMatches = (item) => {
    if (item.name.toLowerCase().includes(searchLower)) return true;
    if (item.children) {
      return item.children.some((child) => itemMatches(child));
    }
    return false;
  };

  const filter = (items) => {
    return items
      .map((item) => {
        if (!item.children) {
          return itemMatches(item) ? item : null;
        }

        const filteredChildren = filter(item.children);
        if (filteredChildren.length > 0 || item.name.toLowerCase().includes(searchLower)) {
          expandedIds.add(item.id);
          return { ...item, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean);
  };

  return { items: filter(items), expandedIds };
}

export default function VirtualizedTree({
  data,
  getIcon,
  searchPlaceholder = 'Search...',
  showExpandAll = true,
  rowHeight = 36,
  className,
  autoExpandMatch,
  // Selection config
  selectableDepths = [1, 2, 3], // Which depths are selectable (0=area, 1=district, 2=source, 3=street)
  defaultChildMatcher, // (child) => boolean - when selecting a parent, select leaves from this child only
  onSelectionChange, // (selectedItems) => void - callback with selected items including ancestry
  selectionColor = 'bg-blue-100', // Tailwind class for selection highlight
}) {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const parentRef = useRef(null);

  // Build a map of item IDs to their data for quick lookup
  const itemMap = useMemo(() => {
    const map = new Map();
    const buildMap = (items, ancestry = []) => {
      items.forEach((item) => {
        const nodeAncestry = [...ancestry, { id: item.id, name: item.name }];
        map.set(item.id, { ...item, ancestry: nodeAncestry });
        if (item.children) buildMap(item.children, nodeAncestry);
      });
    };
    buildMap(data);
    return map;
  }, [data]);

  // Filter and flatten tree
  const { filteredData, searchExpandedIds } = useMemo(() => {
    const { items, expandedIds } = filterTree(data, searchQuery);
    return { filteredData: items, searchExpandedIds: expandedIds };
  }, [data, searchQuery]);

  // Merge expanded IDs with search-expanded IDs
  const effectiveExpandedIds = useMemo(() => {
    return new Set([...expandedIds, ...searchExpandedIds]);
  }, [expandedIds, searchExpandedIds]);

  // Flatten visible nodes
  const flatNodes = useMemo(() => {
    return flattenTree(filteredData, effectiveExpandedIds);
  }, [filteredData, effectiveExpandedIds]);

  // Virtual list
  const virtualizer = useVirtualizer({
    count: flatNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  // Get selected items with full ancestry for callback
  const getSelectedItems = useCallback(() => {
    return Array.from(selectedIds)
      .map((id) => itemMap.get(id))
      .filter(Boolean);
  }, [selectedIds, itemMap]);

  // Notify parent of selection changes
  const notifySelectionChange = useCallback((newSelectedIds) => {
    if (onSelectionChange) {
      const items = Array.from(newSelectedIds)
        .map((id) => itemMap.get(id))
        .filter(Boolean);
      onSelectionChange(items);
    }
  }, [onSelectionChange, itemMap]);

  const handleToggle = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // When expanding, also auto-expand matching children
        if (autoExpandMatch) {
          const item = itemMap.get(id);
          if (item?.children) {
            item.children.forEach((child) => {
              if (child.children && autoExpandMatch(child)) {
                next.add(child.id);
              }
            });
          }
        }
      }
      return next;
    });
  }, [autoExpandMatch, itemMap]);

  const handleSelect = useCallback((node, event) => {
    const isMultiSelect = event.metaKey || event.ctrlKey;
    const depth = node.depth;

    // Check if this depth is selectable
    if (!selectableDepths.includes(depth)) return;

    setSelectedIds((prev) => {
      const item = itemMap.get(node.id);

      // If it's a leaf node (street), just select/deselect it
      if (!item?.children || item.children.length === 0) {
        const isCurrentlySelected = prev.has(node.id);

        if (isMultiSelect) {
          const next = new Set(prev);
          if (isCurrentlySelected) {
            next.delete(node.id);
          } else {
            next.add(node.id);
          }
          notifySelectionChange(next);
          return next;
        } else {
          // Single select mode: toggle or clear and select
          if (isCurrentlySelected && prev.size === 1) {
            // Only this item selected, deselect it
            notifySelectionChange(new Set());
            return new Set();
          } else {
            // Select only this item
            const next = new Set([node.id]);
            notifySelectionChange(next);
            return next;
          }
        }
      } else {
        // It's a parent node (district or source)
        let leafIds;

        if (defaultChildMatcher && item.children.some((c) => c.children)) {
          // For districts: select leaves from matching child only (e.g., 'claude')
          leafIds = getLeafIdsFromMatchingChild(item, defaultChildMatcher);
          // If no matching child found, fall back to all leaves
          if (leafIds.length === 0) {
            leafIds = getAllLeafIds(item);
          }
        } else {
          // For sources or if no matcher: select all leaves
          leafIds = getAllLeafIds(item);
        }

        // Check if all these leaves are already selected
        const allSelected = leafIds.length > 0 && leafIds.every((id) => prev.has(id));

        if (isMultiSelect) {
          const next = new Set(prev);
          if (allSelected) {
            // Deselect all these leaves
            leafIds.forEach((id) => next.delete(id));
          } else {
            // Add all these leaves
            leafIds.forEach((id) => next.add(id));
          }
          notifySelectionChange(next);
          return next;
        } else {
          // Single select mode
          if (allSelected) {
            // All were selected, deselect all
            notifySelectionChange(new Set());
            return new Set();
          } else {
            // Select only these leaves
            const next = new Set(leafIds);
            notifySelectionChange(next);
            return next;
          }
        }
      }
    });
  }, [selectableDepths, itemMap, defaultChildMatcher, notifySelectionChange]);

  const handleExpandAll = useCallback(() => {
    setExpandedIds(new Set(getAllFolderIds(data)));
  }, [data]);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    notifySelectionChange(new Set());
  }, [notifySelectionChange]);

  return (
    <div className={cn('bg-background rounded-xl border shadow-sm', className)}>
      {/* Header with search and expand/collapse buttons */}
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        {showExpandAll && (
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="sm" className="h-9 px-2" onClick={handleExpandAll}>
              <ChevronDown className="h-4 w-4 mr-1" />
              Expand
            </Button>
            <Button variant="ghost" size="sm" className="h-9 px-2" onClick={handleCollapseAll}>
              <ChevronRight className="h-4 w-4 mr-1" />
              Collapse
            </Button>
          </div>
        )}
      </div>

      {/* Virtualized tree content */}
      <div
        ref={parentRef}
        className="h-[500px] overflow-auto"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const node = flatNodes[virtualRow.index];
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = effectiveExpandedIds.has(node.id);
            const isSelected = selectedIds.has(node.id);
            const isSelectable = selectableDepths.includes(node.depth);

            // Check if any descendant leaves are selected (for parent highlight)
            const hasSelectedDescendants = hasChildren &&
              getAllLeafIds(node).some((id) => selectedIds.has(id));

            return (
              <div
                key={node.path}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={cn(
                  'flex items-center px-4 cursor-default',
                  isSelectable && 'cursor-pointer',
                  isSelected && selectionColor,
                  !isSelected && hasSelectedDescendants && 'bg-blue-50/50',
                  !isSelected && !hasSelectedDescendants && 'hover:bg-muted/50'
                )}
                onClick={(e) => {
                  if (isSelectable) {
                    handleSelect(node, e);
                  }
                }}
              >
                {/* Indentation */}
                <div style={{ width: `${node.depth * 20}px` }} />

                {/* Expand/collapse button or spacer */}
                {hasChildren ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(node.id);
                    }}
                    className="h-6 w-6 flex items-center justify-center hover:bg-muted rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                ) : (
                  <div className="w-6" />
                )}

                {/* Icon */}
                {getIcon && (
                  <span className="mr-2 flex-shrink-0">
                    {getIcon(node, node.depth)}
                  </span>
                )}

                {/* Label */}
                <span className={cn(
                  'truncate text-sm',
                  !isSelectable && 'text-muted-foreground'
                )}>
                  {node.name}
                </span>

                {/* Selection indicator for parents with selected children */}
                {hasSelectedDescendants && !isSelected && (
                  <span className="ml-2 text-xs text-blue-500">
                    ({getAllLeafIds(node).filter((id) => selectedIds.has(id)).length} selected)
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer with stats */}
      <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-muted-foreground">
        <span>
          {flatNodes.length} items visible
          {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
        </span>
        {selectedIds.size > 0 && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearSelection}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
