import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadArtifacts, getAllTags, loadToyboxConfig } from '../lib/artifactLoader';
import { Artifact } from '../lib/types';
import { ToyboxConfig } from '../lib/store';

export function ArtifactGallery() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [config, setConfig] = useState<ToyboxConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filtering and sorting state
  const [filterType, setFilterType] = useState<'react' | 'svg' | 'mermaid' | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'title'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showHidden, setShowHidden] = useState(false);
  
  // Get all available tags and categories for filter dropdown
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  useEffect(() => {
    // Load artifacts and config when component mounts
    const fetchData = async () => {
      try {
        const [loadedArtifacts, loadedConfig] = await Promise.all([
          Promise.resolve(loadArtifacts()),
          loadToyboxConfig()
        ]);
        setArtifacts(loadedArtifacts);
        setConfig(loadedConfig);
        setAllTags(getAllTags());
        
        // Get all unique categories
        const categories = [...new Set(loadedArtifacts
          .map(artifact => (artifact as any).category)
          .filter(Boolean)
        )];
        setAllCategories(categories);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Apply filters and sorting to artifacts
  const filteredAndSortedArtifacts = useMemo(() => {
    // Filter artifacts based on criteria
    const filtered = artifacts.filter(artifact => {
      const artifactWithCategory = artifact as any;
      
      // Filter hidden artifacts - 기본적으로 숨긴 항목은 표시하지 않음
      if (artifactWithCategory.hidden === true && showHidden === false) {
        return false;
      }
      
      // Filter by type
      if (filterType !== 'all' && artifact.type !== filterType) {
        return false;
      }
      
      // Filter by category
      if (filterCategory !== 'all' && artifactWithCategory.category !== filterCategory) {
        return false;
      }
      
      // Filter by tag
      if (filterTag !== 'all' && !artifact.tags.includes(filterTag)) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = artifact.title.toLowerCase().includes(searchLower);
        const descMatch = artifact.description?.toLowerCase().includes(searchLower) || false;
        const tagMatch = artifact.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!titleMatch && !descMatch && !tagMatch) {
          return false;
        }
      }
      
      return true;
    });
    
    // Then, sort the filtered artifacts
    return [...filtered].sort((a, b) => {
      // Handle different sort fields
      if (sortBy === 'title') {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return sortOrder === 'asc' 
          ? titleA.localeCompare(titleB)
          : titleB.localeCompare(titleA);
      } else {
        // Sort by date (createdAt or updatedAt)
        const dateA = new Date(a[sortBy]).getTime();
        const dateB = new Date(b[sortBy]).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  }, [artifacts, filterType, filterCategory, filterTag, searchTerm, sortBy, sortOrder, showHidden]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading artifacts...</span>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <img src={`${import.meta.env.BASE_URL}logo_small.jpg`} alt="Yooshin Logo" className="h-12 w-auto" />
          <div>
            <h1 className="text-3xl font-bold mb-1">Yooshin Development Tools</h1>
            <p className="text-gray-600">유신엔지니어링에서 사용하는 개발 도구 모음</p>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-gray-50 border rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium">Browse Projects</h2>
          <button
            onClick={() => setShowHidden(!showHidden)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              showHidden 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showHidden ? '숨긴 프로젝트 숨기기' : `숨긴 프로젝트 표시 (${artifacts.filter(a => (a as any).hidden).length}개)`}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter by category"
            >
              <option value="all">전체 카테고리</option>
              {allCategories.map(category => (
                <option key={category} value={category}>
                  {category === 'development' && '개발 도구'}
                  {category === 'productivity' && '생산성'}
                  {category === 'tools' && '유틸리티'}
                  {category === 'medical' && '의료'}
                  {category === 'entertainment' && '엔터테인먼트'}
                  {!['development', 'productivity', 'tools', 'medical', 'entertainment'].includes(category) && category}
                </option>
              ))}
            </select>
          </div>
          
          {/* Type filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">타입</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'react' | 'svg' | 'mermaid' | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter by type"
            >
              <option value="all">모든 타입</option>
              <option value="react">React 컴포넌트</option>
              <option value="svg">SVG 그래픽</option>
              <option value="mermaid">Mermaid 다이어그램</option>
            </select>
          </div>
          
          {/* Tag filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter by tag"
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Clear filters button */}
        {(filterType !== 'all' || filterCategory !== 'all' || filterTag !== 'all' || searchTerm) && (
          <div className="mt-3 text-right">
            <button
              onClick={() => {
                setFilterType('all');
                setFilterCategory('all');
                setFilterTag('all');
                setSearchTerm('');
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              모든 필터 초기화
            </button>
          </div>
        )}
      </div>
      
      {/* Artifacts */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-medium">
          프로젝트 {filteredAndSortedArtifacts.length > 0 && `(${filteredAndSortedArtifacts.length})`}
        </h2>
        
        {/* Sorting controls */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'updatedAt' | 'createdAt' | 'title')}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            aria-label="Sort by field"
          >
            <option value="updatedAt">Sort by: Last Updated</option>
            <option value="createdAt">Sort by: Created</option>
            <option value="title">Sort by: Title</option>
          </select>
          
          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 border rounded hover:bg-gray-100"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
      
      {filteredAndSortedArtifacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedArtifacts.map((artifact) => (
            <Link 
              key={artifact.id} 
              to={`/a/${artifact.id}`}
              className="group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full bg-white hover:translate-y-[-2px]"
            >
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">{artifact.title || 'Untitled Project'}</h2>
                  <div className="flex gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      artifact.type === 'react' 
                        ? 'bg-blue-100 text-blue-800' 
                        : artifact.type === 'svg' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                    }`}>
                      {artifact.type === 'react' && 'React'}
                      {artifact.type === 'svg' && 'SVG'}
                      {artifact.type === 'mermaid' && 'Mermaid'}
                    </span>
                    <Link 
                      to={`/standalone/${artifact.id}`}
                      className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                      onClick={(e) => e.stopPropagation()}
                      title="View standalone without gallery wrapper"
                    >
                      Standalone
                    </Link>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3 flex-grow line-clamp-3">{artifact.description || 'No description available'}</p>
                
                {artifact.tags && artifact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {artifact.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="text-sm text-gray-500">
                  Updated: {new Date(artifact.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          {artifacts.length === 0 ? (
            <p className="text-gray-600 mb-4">No projects found in this portfolio</p>
          ) : (
            <p className="text-gray-600 mb-4">No projects match your current filters</p>
          )}
          {(filterType !== 'all' || filterCategory !== 'all' || filterTag !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setFilterType('all');
                setFilterCategory('all');
                setFilterTag('all');
                setSearchTerm('');
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              모든 필터 초기화
            </button>
          )}
        </div>
      )}
      
      {config?.showFooter && (
        <footer className="mt-12 pt-6 border-t text-center text-gray-500 text-sm space-y-2">
          <p>COPYRIGHTS (c) 2011 Yooshin Engineering Corporation, ALL RIGHTS RESERVED</p>
          <p>시스템 문의: 02)6202-0141~9</p>
        </footer>
      )}
    </div>
  );
}
