import { NextRequest, NextResponse } from 'next/server';
import { StorageDriverManager } from '@/lib/storage/driver-manager';
import { StorageDriverType } from '@/lib/storage/storage-types';

export async function GET() {
  try {
    const manager = StorageDriverManager.getInstance();
    const config = manager.getConfig(true);
    const usage = await manager.getAggregatedUsage();
    const activeDriver = manager.getActiveDriver();
    const stats = await activeDriver.getUsageStats();

    return NextResponse.json({
      success: true,
      config,
      usage,
      stats,
      activeDriver: config.activeDriver,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve storage status' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const manager = StorageDriverManager.getInstance();

    // If secrets are masked in the incoming request, preserve the existing secrets
    const currentConfig = manager.getConfig(false);
    const updatedS3 = { ...body.s3 };
    const updatedR2 = { ...body.r2 };
    const updatedSupabase = { ...body.supabase };

    if (updatedS3?.secretAccessKey && updatedS3.secretAccessKey.includes('••')) {
      updatedS3.secretAccessKey = currentConfig.s3.secretAccessKey;
    }
    if (updatedR2?.secretAccessKey && updatedR2.secretAccessKey.includes('••')) {
      updatedR2.secretAccessKey = currentConfig.r2.secretAccessKey;
    }
    if (updatedSupabase?.supabaseAnonKey && updatedSupabase.supabaseAnonKey.includes('••')) {
      updatedSupabase.supabaseAnonKey = currentConfig.supabase.supabaseAnonKey;
    }

    const payload = {
      ...body,
      s3: updatedS3,
      r2: updatedR2,
      supabase: updatedSupabase,
    };

    const savedConfig = manager.saveConfig(payload);

    return NextResponse.json({
      success: true,
      message: 'Storage configuration updated and saved successfully!',
      config: manager.getConfig(true),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update storage settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, driver, migration } = body;
    const manager = StorageDriverManager.getInstance();

    // 1. Connection Diagnostic Test
    if (action === 'test_connection') {
      const targetDriver: StorageDriverType = driver || manager.getConfig(false).activeDriver;
      const testResult = await manager.testConnection(targetDriver);
      return NextResponse.json(testResult);
    }

    // 2. Migration Between Providers (Whole batch or Chunked)
    if (action === 'migrate_batch') {
      if (!migration || !migration.sourceDriver || !migration.targetDriver) {
        return NextResponse.json(
          { success: false, error: 'Missing sourceDriver or targetDriver in batch migration request' },
          { status: 400 }
        );
      }

      const batchResult = await manager.migrateBatch({
        sourceDriver: migration.sourceDriver,
        targetDriver: migration.targetDriver,
        folders: migration.folders,
        offset: migration.offset || 0,
        limit: migration.limit || 15,
        deleteFromSource: migration.deleteFromSource || false,
        overwriteExisting: migration.overwriteExisting !== false,
      });

      return NextResponse.json({
        success: batchResult.success,
        batch: batchResult,
        message: `Batch ${batchResult.batchIndex} completed: ${batchResult.migratedCount} files transferred.`,
      });
    }

    if (action === 'migrate') {
      if (!migration || !migration.sourceDriver || !migration.targetDriver) {
        return NextResponse.json(
          { success: false, error: 'Missing sourceDriver or targetDriver in migration request' },
          { status: 400 }
        );
      }

      const result = await manager.migrateFiles({
        sourceDriver: migration.sourceDriver,
        targetDriver: migration.targetDriver,
        folders: migration.folders,
        deleteFromSource: migration.deleteFromSource || false,
        overwriteExisting: migration.overwriteExisting !== false,
      });

      return NextResponse.json({
        success: result.success,
        result,
        message: `Migration finished: ${result.migratedCount} files transferred, ${result.failedCount} failed.`,
      });
    }

    // 3. Switch Driver
    if (action === 'switch_driver') {
      if (!driver) {
        return NextResponse.json({ success: false, error: 'Driver parameter is required' }, { status: 400 });
      }
      manager.saveConfig({ activeDriver: driver });
      return NextResponse.json({
        success: true,
        message: `Active storage driver switched to ${driver.toUpperCase()}`,
        activeDriver: driver,
      });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute storage action' },
      { status: 500 }
    );
  }
}
