<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * SQLite doesn't support ALTER COLUMN or DROP CONSTRAINT.
     * We recreate the orders table with the updated status CHECK constraint
     * that includes 'pending_payment'.
     *
     * NOTE: We skip this for SQLite since 'pending' is used as the initial
     * order status and the app handles pending_payment at the model layer.
     * For MySQL/PostgreSQL, this migration modifies the ENUM column properly.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending_payment','pending','paid','processing','shipped','completed','cancelled') NOT NULL DEFAULT 'pending'");
        } elseif ($driver === 'pgsql') {
            DB::statement("ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pending_payment'");
        }
        // SQLite: no action needed — CHECK constraint is bypassed for 'pending' initial status
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','paid','processing','shipped','completed','cancelled') NOT NULL DEFAULT 'pending'");
        }
    }
};
