import React, { useMemo, useState } from 'react';
import type { Skill, SkillFolder, SkillCategory, Difficulty, SkillPrerequisite } from '../types';
import { SkillTree } from './SkillTree';
import { IconPicker } from './IconPicker';
import CreateSkillForm from './CreateSkillForm';

interface SkillsPageProps {
  skills: Skill[];
  skillFolders: SkillFolder[];
  categories: SkillCategory[];
  improveSkill: (skillId: string) => void;
  addSkill: (name: string, grade: Difficulty, stars: number, status: 'locked' | 'unlocked', category: string, description: string, guide: string, prerequisites: SkillPrerequisite[], folderId?: string) => void;
  addSkillFolder: (name: string, category: string, icon: string) => void;
  addCategory: (name: string, icon: string) => void;
  onDeleteSkill: (skillId: string) => void;
  onDeleteSkillFolder: (folderId: string) => void;
  onDeleteCategory: (categoryName: string) => void;
}

type View = 'categories' | 'folders' | 'tree' | 'add';

const DefaultIconPlaceholder: React.FC<{ className?: string }> = ({ className = 'h-7 w-7' }) => (
  <svg className={`${className} text-blue-300/70`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
  </svg>
);

const DeleteButton: React.FC<{ label: string; onClick: (e: React.MouseEvent) => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-3 right-3 p-1.5 rounded bg-black/50 text-gray-500 hover:bg-red-900/80 hover:text-red-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
    aria-label={label}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  </button>
);

const SectionHeader: React.FC<{ eyebrow: string; title: string; count?: number }> = ({ eyebrow, title, count }) => (
  <div className="flex items-end justify-between gap-3 mb-4">
    <div>
      <p className="font-orbitron text-[8px] text-blue-400/60 uppercase tracking-[0.3em]">{eyebrow}</p>
      <h3 className="font-orbitron text-lg md:text-xl font-black text-white uppercase tracking-widest">{title}</h3>
    </div>
    {typeof count === 'number' && <span className="font-orbitron text-[10px] text-blue-300/70 uppercase tracking-widest">{count} items</span>}
  </div>
);

const Breadcrumbs: React.FC<{
  view: View;
  category?: string | null;
  folder?: SkillFolder | null;
  onNavigate: (targetView: View) => void;
}> = ({ view, category, folder, onNavigate }) => (
  <div className="flex flex-wrap items-center gap-2 font-orbitron text-[10px] uppercase tracking-widest text-gray-500">
    <button onClick={() => onNavigate('categories')} className="hover:text-blue-300 transition-colors">Skills</button>
    {category && (
      <>
        <span>/</span>
        <button onClick={() => onNavigate('folders')} disabled={view === 'folders'} className="hover:text-blue-300 disabled:text-blue-300 disabled:cursor-default transition-colors">{category}</button>
      </>
    )}
    {folder && (
      <>
        <span>/</span>
        <span className="text-blue-300">{folder.name}</span>
      </>
    )}
    {view === 'add' && (
      <>
        <span>/</span>
        <span className="text-blue-300">New Skill</span>
      </>
    )}
  </div>
);

const EmptyState: React.FC<{ title: string; message: string }> = ({ title, message }) => (
  <div className="border border-blue-500/10 bg-black/25 rounded p-8 text-center">
    <p className="font-orbitron text-sm text-gray-300 uppercase tracking-widest mb-2">{title}</p>
    <p className="text-xs text-gray-500 uppercase tracking-widest leading-relaxed">{message}</p>
  </div>
);

export const SkillsPage: React.FC<SkillsPageProps> = ({
  skills,
  skillFolders,
  categories,
  improveSkill,
  addSkill,
  addSkillFolder,
  addCategory,
  onDeleteSkill,
  onDeleteSkillFolder,
  onDeleteCategory,
}) => {
  const [view, setView] = useState<View>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<SkillFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');

  const skillStats = useMemo(() => ({
    categories: categories.length,
    folders: skillFolders.length,
    skills: skills.length,
    locked: skills.filter(skill => skill.status === 'locked').length,
  }), [categories.length, skillFolders.length, skills]);

  const navigate = (targetView: View) => {
    if (targetView === 'categories') {
      setSelectedCategory(null);
      setSelectedFolder(null);
    }
    if (targetView === 'folders') setSelectedFolder(null);
    setView(targetView);
  };

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !selectedCategory) return;
    addSkillFolder(newFolderName.trim(), selectedCategory, newFolderIcon);
    setNewFolderName('');
    setNewFolderIcon('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim(), newCategoryIcon);
    setNewCategoryName('');
    setNewCategoryIcon('');
  };

  const renderContent = () => {
    if (view === 'add') {
      return (
        <div className="border border-blue-500/20 bg-[#020617] rounded p-4 md:p-6">
          <CreateSkillForm
            addSkill={(...args) => { addSkill(...args); navigate('categories'); }}
            skills={skills}
            skillFolders={skillFolders}
            categories={categories}
          />
        </div>
      );
    }

    if (view === 'tree' && selectedFolder) {
      const folderSkills = skills.filter(skill => skill.folderId === selectedFolder.id);
      return (
        <div className="space-y-4">
          <SectionHeader eyebrow="Skill Tree" title={selectedFolder.name} count={folderSkills.length} />
          {folderSkills.length > 0 ? (
            <div className="border border-blue-500/10 bg-black/20 rounded overflow-x-auto">
              <SkillTree skills={folderSkills} onImprove={improveSkill} onDelete={onDeleteSkill} />
            </div>
          ) : (
            <EmptyState title="No skills logged" message="Initialize a skill and assign it to this folder." />
          )}
        </div>
      );
    }

    if (view === 'folders' && selectedCategory) {
      const foldersInCategory = skillFolders.filter(folder => folder.category === selectedCategory);
      const unassignedSkills = skills.filter(skill => skill.category === selectedCategory && !skill.folderId);

      return (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
          <div className="space-y-6">
            <section>
              <SectionHeader eyebrow="Category" title={selectedCategory} count={foldersInCategory.length + unassignedSkills.length} />
              {foldersInCategory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {foldersInCategory.map(folder => {
                    const count = skills.filter(skill => skill.folderId === folder.id).length;
                    return (
                      <div key={folder.id} className="group relative">
                        <button
                          onClick={() => { setSelectedFolder(folder); setView('tree'); }}
                          className="w-full h-full text-left border border-blue-500/20 bg-black/35 hover:bg-blue-500/10 hover:border-blue-400/50 rounded p-4 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-11 w-11 rounded border border-blue-500/20 bg-blue-500/5 flex items-center justify-center overflow-hidden shrink-0">
                              {folder.icon ? <img src={folder.icon} alt={folder.name} className="h-full w-full object-cover" /> : <DefaultIconPlaceholder />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-orbitron text-sm text-white uppercase tracking-widest truncate">{folder.name}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{count} skills</p>
                            </div>
                          </div>
                        </button>
                        <DeleteButton label={`Delete folder ${folder.name}`} onClick={(e) => { e.stopPropagation(); onDeleteSkillFolder(folder.id); }} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="No folders" message="Create a folder to organize this category." />
              )}
            </section>

            {unassignedSkills.length > 0 && (
              <section>
                <SectionHeader eyebrow="Loose Entries" title="Unassigned Skills" count={unassignedSkills.length} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {unassignedSkills.map(skill => (
                    <div key={skill.id} className="border border-white/10 bg-black/25 rounded px-3 py-2 flex items-center justify-between gap-3">
                      <span className="font-orbitron text-[10px] text-gray-300 uppercase tracking-widest truncate">[{skill.grade}] {skill.name}</span>
                      <span className="text-[10px] text-yellow-300 shrink-0">{skill.stars} stars</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <form onSubmit={handleAddFolder} className="border border-blue-500/20 bg-[#020617] rounded p-4 space-y-4 h-fit">
            <SectionHeader eyebrow="Organize" title="New Folder" />
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full bg-black/40 border border-blue-500/20 rounded px-4 py-3 font-orbitron text-xs text-white outline-none focus:border-blue-400 transition-all"
            />
            <IconPicker selectedValue={newFolderIcon} onSelect={setNewFolderIcon} />
            <button type="submit" className="w-full font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-4 py-3 rounded text-[10px] font-black uppercase tracking-widest border border-blue-400/40 transition-all">
              Create Folder
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
        <section>
          <SectionHeader eyebrow="Library" title="Categories" count={categories.length} />
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {categories.map(category => {
                const folderCount = skillFolders.filter(folder => folder.category === category.name).length;
                const skillCount = skills.filter(skill => skill.category === category.name).length;
                return (
                  <div key={category.name} className="group relative">
                    <button
                      onClick={() => { setSelectedCategory(category.name); setView('folders'); }}
                      className="w-full h-full text-left border border-blue-500/20 bg-black/35 hover:bg-blue-500/10 hover:border-blue-400/50 rounded p-4 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-11 w-11 rounded border border-blue-500/20 bg-blue-500/5 flex items-center justify-center overflow-hidden shrink-0">
                          {category.icon ? <img src={category.icon} alt={category.name} className="h-full w-full object-cover" /> : <DefaultIconPlaceholder />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-orbitron text-sm text-white uppercase tracking-widest truncate">{category.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{folderCount} folders | {skillCount} skills</p>
                        </div>
                      </div>
                    </button>
                    <DeleteButton label={`Delete category ${category.name}`} onClick={(e) => { e.stopPropagation(); onDeleteCategory(category.name); }} />
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No categories" message="Create your first category to begin mapping skills." />
          )}
        </section>

        <form onSubmit={handleAddCategory} className="border border-blue-500/20 bg-[#020617] rounded p-4 space-y-4 h-fit">
          <SectionHeader eyebrow="Classify" title="New Category" />
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name"
            className="w-full bg-black/40 border border-blue-500/20 rounded px-4 py-3 font-orbitron text-xs text-white outline-none focus:border-blue-400 transition-all"
          />
          <IconPicker selectedValue={newCategoryIcon} onSelect={setNewCategoryIcon} />
          <button type="submit" className="w-full font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-4 py-3 rounded text-[10px] font-black uppercase tracking-widest border border-blue-400/40 transition-all">
            Create Category
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-0">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2">
          <Breadcrumbs view={view} category={selectedCategory} folder={selectedFolder} onNavigate={navigate} />
          <div>
            <p className="font-orbitron text-[9px] text-blue-400/70 uppercase tracking-[0.35em]">Ability Matrix</p>
            <h2 className="font-orbitron text-2xl md:text-3xl text-blue-300 uppercase tracking-widest font-black">Skills</h2>
          </div>
        </div>
        <button
          onClick={() => setView(view === 'add' ? 'categories' : 'add')}
          className="font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-4 py-3 rounded text-[10px] font-black uppercase tracking-widest border border-blue-400/40 transition-all"
        >
          {view === 'add' ? 'Abort Entry' : 'Initialize Skill'}
        </button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="border border-blue-500/10 bg-black/25 rounded p-3"><p className="font-orbitron text-[8px] text-gray-500 uppercase tracking-widest">Categories</p><p className="font-orbitron text-xl text-white font-black">{skillStats.categories}</p></div>
        <div className="border border-blue-500/10 bg-black/25 rounded p-3"><p className="font-orbitron text-[8px] text-gray-500 uppercase tracking-widest">Folders</p><p className="font-orbitron text-xl text-white font-black">{skillStats.folders}</p></div>
        <div className="border border-blue-500/10 bg-black/25 rounded p-3"><p className="font-orbitron text-[8px] text-gray-500 uppercase tracking-widest">Skills</p><p className="font-orbitron text-xl text-white font-black">{skillStats.skills}</p></div>
        <div className="border border-blue-500/10 bg-black/25 rounded p-3"><p className="font-orbitron text-[8px] text-gray-500 uppercase tracking-widest">Locked</p><p className="font-orbitron text-xl text-white font-black">{skillStats.locked}</p></div>
      </div>

      {renderContent()}
    </div>
  );
};
