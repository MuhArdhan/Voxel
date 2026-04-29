<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'VOXEL Admin',
            'email' => 'admin@voxel.id',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create test user
        $user = User::create([
            'name' => 'Test User',
            'email' => 'user@voxel.id',
            'password' => Hash::make('password'),
            'role' => 'user',
            'phone' => '081234567890',
        ]);

        // Create categories
        $categories = [
            ['name' => 'Hoodies', 'description' => 'Cyber-tech hoodies for the street', 'is_active' => true],
            ['name' => 'T-Shirts', 'description' => 'Futuristic graphic tees', 'is_active' => true],
            ['name' => 'Jackets', 'description' => 'Tech-enhanced outerwear', 'is_active' => true],
            ['name' => 'Pants', 'description' => 'Utility cyber pants', 'is_active' => true],
            ['name' => 'Accessories', 'description' => 'Cyber accessories', 'is_active' => true],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        // Create sample products
        $hoodie = Category::where('name', 'Hoodies')->first();
        $tshirt = Category::where('name', 'T-Shirts')->first();
        $jacket = Category::where('name', 'Jackets')->first();

        $products = [
            [
                'category_id' => $hoodie->id,
                'name' => 'NEON GRID Hoodie',
                'description' => 'Oversized hoodie dengan print grid neon cyan. Material premium fleece 380gsm dengan water-resistant coating.',
                'material' => '380gsm Premium Fleece, Water-Resistant Coating',
                'price' => 459000,
                'sku' => 'VXL-HDD-001',
                'is_limited_drop' => false,
                'is_active' => true,
                'is_featured' => true,
                'weight' => 600,
            ],
            [
                'category_id' => $hoodie->id,
                'name' => 'VOID CIRCUIT Hoodie',
                'description' => 'Limited drop hoodie dengan print circuit board di bagian belakang. Edisi terbatas hanya 100 pcs.',
                'material' => '350gsm Premium Fleece',
                'price' => 549000,
                'sku' => 'VXL-HDD-002',
                'is_limited_drop' => true,
                'is_active' => true,
                'is_featured' => true,
                'weight' => 580,
            ],
            [
                'category_id' => $tshirt->id,
                'name' => 'PIXEL GLITCH Tee',
                'description' => 'T-shirt oversize dengan efek glitch pixel pada desain depan. Cotton combed 24s.',
                'material' => 'Cotton Combed 24s',
                'price' => 259000,
                'sku' => 'VXL-TEE-001',
                'is_limited_drop' => false,
                'is_active' => true,
                'is_featured' => false,
                'weight' => 250,
            ],
            [
                'category_id' => $tshirt->id,
                'name' => 'SYSTEM ERROR Tee',
                'description' => 'Graphic tee dengan message "SYSTEM_ERROR_404" dalam font tech. 100% cotton.',
                'material' => 'Cotton Combed 30s',
                'price' => 229000,
                'sku' => 'VXL-TEE-002',
                'is_limited_drop' => false,
                'is_active' => true,
                'is_featured' => false,
                'weight' => 220,
            ],
            [
                'category_id' => $jacket->id,
                'name' => 'STEALTH TECH Jacket',
                'description' => 'Tactical bomber jacket dengan bahan ripstop dan reflective print. Futuristic cyber aesthetic.',
                'material' => 'Ripstop Nylon, Reflective Print',
                'price' => 799000,
                'sku' => 'VXL-JKT-001',
                'is_limited_drop' => true,
                'is_active' => true,
                'is_featured' => true,
                'weight' => 900,
            ],
        ];

        $sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

        foreach ($products as $productData) {
            $product = Product::create($productData);

            // Add variants (sizes)
            foreach ($sizes as $index => $size) {
                $product->variants()->create([
                    'size' => $size,
                    'color' => 'Black',
                    'stock' => rand(5, 30),
                    'additional_price' => $index >= 4 ? 20000 : 0, // XL, XXL +20k
                ]);
            }
        }

        $this->command->info('✅ Seeder completed! Accounts:');
        $this->command->info('   Admin: admin@voxel.id / password');
        $this->command->info('   User:  user@voxel.id / password');
    }
}
