import { ThemeManifest } from '@/lib/extensions/theme-types';
import { PluginManifest } from '@/lib/extensions/plugin-types';

export interface DiagnosticIssue {
  type: 'error' | 'warning';
  field: string;
  message: string;
  fix: string;
}

export interface DiagnosticReport {
  isValid: boolean;
  issues: DiagnosticIssue[];
  checkedAt: string;
  packageName: string;
  packageType: 'theme' | 'plugin';
}

/**
 * Theme & Plugin Compatibility Checker
 * Performs extensive verification of manifests, dependencies, SQL migrations, structures, and permissions.
 */
export class CompatibilityChecker {
  private static CURRENT_APP_VERSION = '1.2.0';
  private static WHITELISTED_PERMISSIONS = [
    'storage_access',
    'payment_hooks',
    'network_requests',
    'media_transform',
    'notifications_send',
    'security_audit',
    'ai_service',
    'database_write',
    'network_access',
    'custom_routes'
  ];

  /**
   * Run detailed compatibility check on a theme package
   */
  public static checkTheme(
    manifest: Partial<ThemeManifest>,
    folderNames: string[],
    existingThemes: ThemeManifest[] = [],
    existingPlugins: PluginManifest[] = []
  ): DiagnosticReport {
    const report: DiagnosticReport = {
      isValid: true,
      issues: [],
      checkedAt: new Date().toISOString(),
      packageName: manifest?.name || 'Unknown Theme',
      packageType: 'theme'
    };

    const addIssue = (type: 'error' | 'warning', field: string, message: string, fix: string) => {
      report.issues.push({ type, field, message, fix });
      if (type === 'error') {
        report.isValid = false;
      }
    };

    // 1. Manifest field validations
    if (!manifest) {
      addIssue('error', 'manifest', 'Manifest JSON is empty or malformed.', 'Ensure the theme ZIP includes a valid manifest.json.');
      return report;
    }
    if (!manifest.id || typeof manifest.id !== 'string') {
      addIssue('error', 'id', 'Theme manifest is missing a valid "id".', 'Define an "id" field in manifest.json (e.g. "theme-custom-style").');
    }
    if (!manifest.slug || typeof manifest.slug !== 'string') {
      addIssue('error', 'slug', 'Theme manifest is missing a valid "slug".', 'Define a "slug" matching standard URL formatting rules.');
    }
    if (!manifest.version || typeof manifest.version !== 'string') {
      addIssue('error', 'version', 'Theme manifest is missing a valid "version" string.', 'Set a version string like "1.0.0".');
    }
    if (!manifest.tokens || typeof manifest.tokens !== 'object') {
      addIssue('error', 'tokens', 'Theme manifest is missing "tokens" object definitions.', 'Include a "tokens" object mapping colors (primary, background, surface).');
    } else {
      const t = manifest.tokens;
      if (!t.primary) addIssue('error', 'tokens.primary', 'Missing primary brand color in design tokens.', 'Add "primary": "#HEX" under the tokens object.');
      if (!t.background) addIssue('error', 'tokens.background', 'Missing background color in design tokens.', 'Add "background": "#HEX" under the tokens object.');
      if (!t.surface) addIssue('error', 'tokens.surface', 'Missing surface color in design tokens.', 'Add "surface": "#HEX" under the tokens object.');
    }

    // 2. App version checks
    if (manifest.minAppVersion) {
      const isCompatible = this.compareVersions(this.CURRENT_APP_VERSION, manifest.minAppVersion);
      if (!isCompatible) {
        addIssue('error', 'minAppVersion', `Theme requires CreatorPulse v${manifest.minAppVersion} or higher (current is v${this.CURRENT_APP_VERSION}).`, 'Upgrade the core platform or request an older version of the theme.');
      }
    }
    const rawThemeAny = manifest as Record<string, unknown>;
    if (rawThemeAny.maxAppVersion && typeof rawThemeAny.maxAppVersion === 'string') {
      const isCompatible = this.compareVersions(rawThemeAny.maxAppVersion, this.CURRENT_APP_VERSION);
      if (!isCompatible) {
        addIssue('warning', 'maxAppVersion', `Theme was designed for CreatorPulse up to v${rawThemeAny.maxAppVersion} (current is v${this.CURRENT_APP_VERSION}). It might experience visual layout bugs.`, 'Contact theme developer for an update.');
      }
    }

    // 3. Duplicate ID Collision check
    const idCollision = existingThemes.find(t => t.id === manifest.id && t.slug !== manifest.slug);
    if (idCollision) {
      addIssue('error', 'id', `Theme ID "${manifest.id}" collides with an existing theme in folder "/themes/${idCollision.slug}".`, 'Change the "id" field in manifest.json to a unique identifier.');
    }

    // 4. Folder structure check — only run when folderNames is provided (ZIP upload).
    //    During activation of an already-installed theme, folderNames is [] so we skip.
    if (folderNames.length > 0) {
      const standardFolders = [
        'pages', 'layouts', 'components', 'icons', 'images', 'fonts',
        'styles', 'css', 'js', 'animations', 'assets', 'templates',
        'partials', 'hooks', 'config', 'locales', 'preview'
      ];
      const presentDirs = new Set(folderNames);
      const missing = standardFolders.filter(d => !presentDirs.has(d));
      if (presentDirs.size < 10) {
        addIssue('error', 'directoryHealth', `Non-compliant structure: Contains only ${presentDirs.size}/17 standard Theme SDK folders.`, `Create standard subdirectories. Missing standard directories: ${missing.join(', ')}`);
      } else if (missing.length > 0) {
        addIssue('warning', 'directoryHealth', `Missing ${missing.length} optional Theme SDK folders: ${missing.join(', ')}.`, 'Adding empty folders helps organize custom layouts.');
      }

      // 5. Unrecognized folders
      const extraDirs = folderNames.filter(dir => !standardFolders.includes(dir));
      if (extraDirs.length > 0) {
        addIssue('warning', 'directoryHealth', `Found unrecognized folder structures: ${extraDirs.join(', ')}. Unsafe paths will be ignored.`, 'Align subdirectories strictly with standard SDK folder specifications.');
      }
    }

    // 6. Dependencies check
    if (manifest.dependencies && typeof manifest.dependencies === 'object') {
      const deps = manifest.dependencies as Record<string, unknown>;
      if (deps.plugins && typeof deps.plugins === 'object') {
        for (const [depId, minVer] of Object.entries(deps.plugins)) {
          const installed = existingPlugins.find(p => p.id === depId || p.slug === depId);
          if (!installed) {
            addIssue('error', 'dependencies', `Missing required dependency: Plugin "${depId}" is not installed.`, `Install "${depId}" version >= ${minVer} first.`);
          } else {
            if (installed.version && minVer) {
              const hasCompatibleVersion = this.compareVersions(installed.version, minVer as string);
              if (!hasCompatibleVersion) {
                addIssue('error', 'dependencies', `Incompatible dependency: "${depId}" version is v${installed.version}, but this theme requires version v${minVer} or higher.`, `Upgrade "${depId}" to version ${minVer} or higher.`);
              }
            }
            if (!installed.isEnabled) {
              addIssue('error', 'dependencies', `Dependency disabled: Required plugin "${depId}" is installed but disabled.`, `Enable required plugin "${depId}".`);
            }
          }
        }
      }
    }

    return report;
  }

  /**
   * Run compatibility checks on a plugin package
   */
  public static checkPlugin(
    manifest: Partial<PluginManifest>,
    folderNames: string[],
    existingPlugins: PluginManifest[] = [],
    migrationFiles: { filename: string; content: string }[] = []
  ): DiagnosticReport {
    const report: DiagnosticReport = {
      isValid: true,
      issues: [],
      checkedAt: new Date().toISOString(),
      packageName: manifest?.name || 'Unknown Plugin',
      packageType: 'plugin'
    };

    const addIssue = (type: 'error' | 'warning', field: string, message: string, fix: string) => {
      report.issues.push({ type, field, message, fix });
      if (type === 'error') {
        report.isValid = false;
      }
    };

    // 1. Manifest fields
    if (!manifest) {
      addIssue('error', 'manifest', 'Manifest JSON is empty or malformed.', 'Ensure the plugin ZIP includes a valid manifest.json.');
      return report;
    }
    if (!manifest.id || typeof manifest.id !== 'string') {
      addIssue('error', 'id', 'Plugin ID is missing or invalid.', 'Define a unique "id" field in manifest.json (e.g. "plugin-my-extension").');
    }
    if (!manifest.slug || typeof manifest.slug !== 'string') {
      addIssue('error', 'slug', 'Plugin slug is missing or invalid.', 'Add a matching "slug" to configure routing endpoints.');
    }
    if (!manifest.version || typeof manifest.version !== 'string') {
      addIssue('error', 'version', 'Plugin version string is missing or invalid.', 'Add a "version" string like "1.0.0" in the manifest.');
    }
    if (!Array.isArray(manifest.permissions)) {
      addIssue('error', 'permissions', 'Plugin permissions array is missing.', 'Declare a "permissions" array inside manifest.json (can be empty).');
    } else {
      for (const perm of manifest.permissions) {
        if (!this.WHITELISTED_PERMISSIONS.includes(perm)) {
          addIssue('warning', 'permissions', `Unrecognized permission requested: "${perm}". Unsafe actions are blocked.`, `Only request whitelisted actions: ${this.WHITELISTED_PERMISSIONS.join(', ')}.`);
        }
      }
    }
    if (!Array.isArray(manifest.hooks)) {
      addIssue('error', 'hooks', 'Plugin hooks subscription array is missing.', 'Declare a "hooks" array listing platform triggers.');
    }

    // 2. App version checks
    if (manifest.minAppVersion) {
      const isCompatible = this.compareVersions(this.CURRENT_APP_VERSION, manifest.minAppVersion);
      if (!isCompatible) {
        addIssue('error', 'minAppVersion', `Plugin requires CreatorPulse v${manifest.minAppVersion} or higher (current is v${this.CURRENT_APP_VERSION}).`, 'Upgrade the core platform or request an older version of the plugin.');
      }
    }
    const rawPluginAny = manifest as Record<string, unknown>;
    if (rawPluginAny.maxAppVersion && typeof rawPluginAny.maxAppVersion === 'string') {
      const isCompatible = this.compareVersions(rawPluginAny.maxAppVersion, this.CURRENT_APP_VERSION);
      if (!isCompatible) {
        addIssue('warning', 'maxAppVersion', `Plugin was designed for CreatorPulse up to v${rawPluginAny.maxAppVersion} (current is v${this.CURRENT_APP_VERSION}). It might experience API errors.`, 'Contact plugin developer for updates.');
      }
    }

    // 3. Duplicate ID Collision check
    const idCollision = existingPlugins.find(p => p.id === manifest.id && p.slug !== manifest.slug);
    if (idCollision) {
      addIssue('error', 'id', `Plugin ID "${manifest.id}" collides with an existing plugin in folder "/plugins/${idCollision.slug}".`, 'Change the "id" field in manifest.json to a unique identifier.');
    }

    // 4. Folder structure check — only run when folderNames is provided (ZIP upload).
    //    During activation or runtime checks of an already-installed plugin, folderNames is [] so we skip.
    if (folderNames.length > 0) {
      const standardFolders = [
        'client', 'server', 'api', 'components', 'pages', 'routes', 'hooks',
        'services', 'database', 'migrations', 'settings', 'permissions', 'icons',
        'images', 'css', 'js', 'assets', 'locales', 'jobs', 'events',
        'webhooks', 'tests', 'docs'
      ];
      const presentDirs = new Set(folderNames);
      const missing = standardFolders.filter(d => !presentDirs.has(d));
      if (presentDirs.size < 15) {
        addIssue('error', 'directoryHealth', `Non-compliant structure: Contains only ${presentDirs.size}/23 standard Plugin SDK folders.`, `Create standard subdirectories. Missing: ${missing.join(', ')}`);
      } else if (missing.length > 0) {
        addIssue('warning', 'directoryHealth', `Missing ${missing.length} optional Plugin SDK folders: ${missing.join(', ')}.`, 'Optional directories can be added for hooks, cron jobs, or tests.');
      }

      // Unrecognized folders
      const extraDirs = folderNames.filter(dir => !standardFolders.includes(dir));
      if (extraDirs.length > 0) {
        addIssue('warning', 'directoryHealth', `Found unrecognized folder structures: ${extraDirs.join(', ')}. Unsafe paths will be ignored.`, 'Align subdirectories strictly with standard SDK folder specifications.');
      }
    }

    // 5. Database migrations checks
    for (const file of migrationFiles) {
      const content = file.content.toLowerCase();
      // Simple safety/malicious SQL detection
      if (content.includes('drop table') && !content.includes('drop table if exists cp_plugin_')) {
        addIssue('error', 'migrations', `Dangerous DB instruction: "${file.filename}" contains table dropping outside plugin namespace.`, 'Do not DROP core platform tables.');
      }
      if (content.includes('alter table') && !content.includes('alter table cp_plugin_') && !content.includes('alter table cp_') && !content.includes('alter table posts') && !content.includes('alter table users')) {
        addIssue('warning', 'migrations', `Dangerous DB instruction: "${file.filename}" attempts to ALTER non-namespaced tables.`, 'Only ALTER tables within the plugin namespace.');
      }
    }

    // 6. Dependencies check
    if (manifest.dependencies && typeof manifest.dependencies === 'object') {
      const deps = manifest.dependencies as Record<string, unknown>;
      if (deps.plugins && typeof deps.plugins === 'object') {
        for (const [depId, minVer] of Object.entries(deps.plugins)) {
          const installed = existingPlugins.find(p => p.id === depId || p.slug === depId);
          if (!installed) {
            addIssue('error', 'dependencies', `Missing required dependency: Plugin "${depId}" is not installed.`, `Install "${depId}" version >= ${minVer} first.`);
          } else {
            if (installed.version && minVer) {
              const hasCompatibleVersion = this.compareVersions(installed.version, minVer as string);
              if (!hasCompatibleVersion) {
                addIssue('error', 'dependencies', `Incompatible dependency: "${depId}" version is v${installed.version}, but this package requires version v${minVer} or higher.`, `Upgrade "${depId}" to version ${minVer} or higher.`);
              }
            }
            if (!installed.isEnabled) {
              addIssue('error', 'dependencies', `Dependency disabled: Required plugin "${depId}" is installed but disabled.`, `Enable required plugin "${depId}".`);
            }
          }
        }
      }
    }

    return report;
  }

  /**
   * Version comparison helper (semver-like)
   * Returns true if v1 >= v2
   */
  public static compareVersions(v1: string, v2: string): boolean {
    try {
      const p1 = v1.split('.').map(Number);
      const p2 = v2.split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        const n1 = p1[i] || 0;
        const n2 = p2[i] || 0;
        if (n1 > n2) return true;
        if (n2 > n1) return false;
      }
      return true;
    } catch {
      return false;
    }
  }
}
