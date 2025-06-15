import Forum from '@/libs/types/entities/Forum';
import ForumCategory from '@/libs/types/entities/ForumCategory';
import { ProfileModel } from '@/libs/types/entities/ProfileModel';

export function getForumUrlName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function canPostInForum(forum: Forum, profile: ProfileModel): boolean {
    if (forum.locked) return false;
    if (forum.permission && !profile.hasPermission(forum.permission)) return false;
    if (forum.categoryPermission && !profile.hasPermission(forum.categoryPermission)) return false;
    return true;
}

export function getCategoryUrlName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function getFormattedForums(category: ForumCategory, profile: ProfileModel): Forum[] {
    return category.forums
        .filter(forum => !forum.permission || profile.hasPermission(forum.permission))
        .sort((a, b) => b.weight - a.weight);
}

export function canPostInCategory(category: ForumCategory, profile: ProfileModel): boolean {
    if (category.permission && !profile.hasPermission(category.permission)) return false;
    return category.forums.some(forum => canPostInForum(forum, profile));
}

export function hasCategoryPermission(category: ForumCategory, profile: ProfileModel): boolean {
    return !category.permission || profile.hasPermission(category.permission);
}

// Helper to create a Forum instance with all required methods
export function createForumInstance(data: Omit<Forum, 'getUrlName' | 'canPost'>): Forum {
    return {
        ...data,
        getUrlName: () => getForumUrlName(data.name),
        canPost: (profile: ProfileModel) => canPostInForum(data, profile)
    };
}

// Helper to create a ForumCategory instance with all required methods
export function createCategoryInstance(data: Omit<ForumCategory, 'getUrlName' | 'getFormattedForums' | 'canPost' | 'hasPermission'>): ForumCategory {
    return {
        ...data,
        getUrlName: () => getCategoryUrlName(data.name),
        getFormattedForums: (profile: ProfileModel) => getFormattedForums(data, profile),
        canPost: (profile: ProfileModel) => canPostInCategory(data, profile),
        hasPermission: (profile: ProfileModel) => hasCategoryPermission(data, profile)
    };
} 