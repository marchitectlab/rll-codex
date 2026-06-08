import React, { useMemo, useState } from 'react';
import { Difficulty, Skill, SkillPrerequisite, SkillFolder, SkillCategory } from '../types';

interface CreateSkillFormProps {
  addSkill: (name: string, grade: Difficulty, stars: number, status: 'locked' | 'unlocked', category: string, description: string, guide: string, prerequisites: SkillPrerequisite[], folderId?: string) => void;
  skills: Skill[];
  skillFolders: SkillFolder[];
  categories: SkillCategory[];
}

const difficultyStyles: Record<Difficulty, { border: string; text: string }> = {
  [Difficulty.E]: { border: 'border-gray-500', text: 'text-gray-300' },
  [Difficulty.D]: { border: 'border-green-600', text: 'text-green-300' },
  [Difficulty.C]: { border: 'border-orange-600', text: 'text-orange-300' },
  [Difficulty.B]: { border: 'border-indigo-600', text: 'text-indigo-300' },
  [Difficulty.A]: { border: 'border-purple-600', text: 'text-purple-300' },
  [Difficulty.S]: { border: 'border-yellow-600', text: 'text-yellow-300' },
  [Difficulty.S_PLUS]: { border: 'border-red-600', text: 'text-red-300' },
  [Difficulty.X]: { border: 'border-red-900', text: 'text-red-400' },
};

const SKILL_UNLOCK_REQUIREMENTS: Record<Difficulty, number> = {
  [Difficulty.E]: 10,
  [Difficulty.D]: 12,
  [Difficulty.C]: 15,
  [Difficulty.B]: 20,
  [Difficulty.A]: 30,
  [Difficulty.S]: 50,
  [Difficulty.S_PLUS]: 75,
  [Difficulty.X]: 999,
};

const FieldLabel: React.FC<{ children: React.ReactNode; optional?: boolean }> = ({ children, optional }) => (
  <label className="block font-orbitron text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
    {children} {optional && <span className="text-gray-600">(Optional)</span>}
  </label>
);

const fieldClass = 'w-full bg-black/40 border border-blue-500/20 rounded px-4 py-3 text-sm text-white outline-none focus:border-blue-400 transition-all';
const selectClass = `${fieldClass} font-orbitron text-xs`;

const CreateSkillForm: React.FC<CreateSkillFormProps> = ({ addSkill, skills, skillFolders, categories }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [grade, setGrade] = useState<Difficulty>(Difficulty.E);
  const [status, setStatus] = useState<'unlocked' | 'locked'>('unlocked');
  const [description, setDescription] = useState('');
  const [guide, setGuide] = useState('');
  const [prerequisites, setPrerequisites] = useState<SkillPrerequisite[]>([]);
  const [selectedPrereq, setSelectedPrereq] = useState('');
  const [requiredStars, setRequiredStars] = useState(1);
  const [folderId, setFolderId] = useState('');

  const availableSkillsForPrereq = useMemo(
    () => skills.filter(skill => !prerequisites.some(prereq => prereq.skillId === skill.id)),
    [skills, prerequisites]
  );

  const availableFolders = useMemo(() => {
    if (!category.trim()) return [];
    return skillFolders.filter(folder => folder.category.toLowerCase() === category.trim().toLowerCase());
  }, [category, skillFolders]);

  const isFormInvalid = !name.trim() || !category.trim() || !folderId;

  const resetForm = () => {
    setName('');
    setCategory('');
    setGrade(Difficulty.E);
    setStatus('unlocked');
    setDescription('');
    setGuide('');
    setPrerequisites([]);
    setSelectedPrereq('');
    setRequiredStars(1);
    setFolderId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid) return;
    addSkill(name.trim(), grade, 0, status, category.trim(), description.trim(), guide.trim(), prerequisites, folderId);
    resetForm();
  };

  const handleAddPrerequisite = () => {
    if (!selectedPrereq || prerequisites.some(prereq => prereq.skillId === selectedPrereq)) return;
    setPrerequisites([...prerequisites, { skillId: selectedPrereq, requiredStars }]);
    setSelectedPrereq('');
    setRequiredStars(1);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="font-orbitron text-[8px] text-blue-400/60 uppercase tracking-[0.3em]">Initialize</p>
        <h3 className="font-orbitron text-xl text-white uppercase tracking-widest font-black">New Skill</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Skill Name</FieldLabel>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter skill name" className={fieldClass} />
        </div>
        <div>
          <FieldLabel>Category</FieldLabel>
          <input
            value={category}
            onChange={e => { setCategory(e.target.value); setFolderId(''); }}
            placeholder="Physical, Mental, Creative..."
            className={fieldClass}
            list="category-suggestions"
          />
          <datalist id="category-suggestions">
            {categories.map(cat => <option key={cat.name} value={cat.name} />)}
          </datalist>
        </div>
        <div>
          <FieldLabel>Folder</FieldLabel>
          <select value={folderId} onChange={e => setFolderId(e.target.value)} disabled={!category.trim() || availableFolders.length === 0} className={`${selectClass} disabled:opacity-50 disabled:cursor-not-allowed`}>
            <option value="">Select folder</option>
            {availableFolders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>Grade</FieldLabel>
          <select value={grade} onChange={e => setGrade(e.target.value as Difficulty)} className={`${selectClass} ${difficultyStyles[grade].border} ${difficultyStyles[grade].text}`}>
            {Object.values(Difficulty).map(value => <option key={value} value={value}>{value}-Grade</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>Initial Status</FieldLabel>
          <select value={status} onChange={e => setStatus(e.target.value as 'unlocked' | 'locked')} className={selectClass}>
            <option value="unlocked">Unlocked</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel optional>Description</FieldLabel>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this skill represent?" rows={4} className={fieldClass} />
        </div>
        <div>
          <FieldLabel optional>Training Guide</FieldLabel>
          <textarea value={guide} onChange={e => setGuide(e.target.value)} placeholder="How should this skill be trained?" rows={4} className={fieldClass} />
        </div>
      </div>

      <section className="border border-blue-500/10 bg-black/25 rounded p-4 space-y-3">
        <FieldLabel optional>Prerequisites</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_110px_auto] gap-2">
          <select value={selectedPrereq} onChange={e => setSelectedPrereq(e.target.value)} className={selectClass}>
            <option value="">Select skill</option>
            {availableSkillsForPrereq.map(skill => <option key={skill.id} value={skill.id}>[{skill.grade}] {skill.name}</option>)}
          </select>
          <input
            type="number"
            value={requiredStars}
            onChange={e => setRequiredStars(Number(e.target.value))}
            min="1"
            max="24.5"
            step="0.5"
            className={`${fieldClass} text-center font-orbitron`}
            aria-label="Required stars"
          />
          <button type="button" onClick={handleAddPrerequisite} className="font-orbitron bg-blue-900/60 hover:bg-blue-800 text-blue-100 px-4 py-3 rounded text-[10px] font-black uppercase tracking-widest border border-blue-500/30 transition-all">
            Add
          </button>
        </div>
        {prerequisites.length > 0 && (
          <div className="space-y-2">
            {prerequisites.map(prereq => {
              const skill = skills.find(item => item.id === prereq.skillId);
              return (
                <div key={prereq.skillId} className="flex items-center justify-between gap-3 bg-black/30 border border-white/10 rounded px-3 py-2">
                  <span className="text-xs text-gray-300">Requires <span className="text-blue-300 font-bold">{skill?.name}</span> at <span className="text-yellow-300 font-bold">{prereq.requiredStars} stars</span></span>
                  <button type="button" onClick={() => setPrerequisites(prerequisites.filter(item => item.skillId !== prereq.skillId))} className="text-red-400 hover:text-red-300 text-lg leading-none">&times;</button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {status === 'locked' && (
        <div className="border border-yellow-500/20 bg-yellow-900/10 rounded p-3 text-[11px] text-yellow-100/80 uppercase tracking-widest leading-relaxed">
          A locked <span className={`${difficultyStyles[grade].text} font-bold`}>{grade}-Grade</span> skill requires <span className="text-yellow-300 font-bold">{SKILL_UNLOCK_REQUIREMENTS[grade]}</span> training sessions to unlock.
        </div>
      )}

      <div className="flex flex-col items-end gap-2">
        <button disabled={isFormInvalid} type="submit" className="font-orbitron bg-blue-700 text-white px-6 py-3 rounded uppercase text-[10px] font-black tracking-widest border border-blue-400/40 transition-all enabled:hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed">
          Add Skill
        </button>
        {isFormInvalid && <p className="text-[10px] text-gray-500 uppercase tracking-widest">Skill name, category, and folder are required.</p>}
      </div>
    </form>
  );
};

export default CreateSkillForm;
