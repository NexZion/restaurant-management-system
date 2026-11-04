<?php

namespace Database\Seeders;

use App\Models\Variant;
use Illuminate\Database\Seeder;

class VariantSeeder extends Seeder
{
    public function run(): void
    {
        $variants = [
            [
                'name' => 'Drink Size',
                'code' => 'DRINK_SIZE',
                'selection_type' => 'single',
                'min_select' => 1,
                'max_select' => 1,
                'options' => [
                    ['name' => 'Regular', 'code' => 'REGULAR', 'default_additional_price' => 0],
                    ['name' => 'Large', 'code' => 'LARGE', 'default_additional_price' => 1.50],
                    ['name' => 'Extra Large', 'code' => 'EXTRA_LARGE', 'default_additional_price' => 2.50],
                ],
            ],
            [
                'name' => 'Burger Add-ons',
                'code' => 'BURGER_ADDONS',
                'selection_type' => 'multiple',
                'min_select' => 0,
                'max_select' => 4,
                'options' => [
                    ['name' => 'Extra Cheese', 'code' => 'EXTRA_CHEESE', 'default_additional_price' => 1.00],
                    ['name' => 'Bacon', 'code' => 'BACON', 'default_additional_price' => 2.00],
                    ['name' => 'Avocado', 'code' => 'AVOCADO', 'default_additional_price' => 1.75],
                    ['name' => 'Fried Egg', 'code' => 'FRIED_EGG', 'default_additional_price' => 1.25],
                ],
            ],
            [
                'name' => 'Pizza Crust',
                'code' => 'PIZZA_CRUST',
                'selection_type' => 'single',
                'min_select' => 1,
                'max_select' => 1,
                'options' => [
                    ['name' => 'Classic', 'code' => 'CLASSIC', 'default_additional_price' => 0],
                    ['name' => 'Thin', 'code' => 'THIN', 'default_additional_price' => 0],
                    ['name' => 'Stuffed Crust', 'code' => 'STUFFED', 'default_additional_price' => 3.00],
                ],
            ],
        ];

        foreach ($variants as $variantData) {
            $options = $variantData['options'];
            unset($variantData['options']);

            $variant = Variant::updateOrCreate(
                ['code' => $variantData['code']],
                [...$variantData, 'is_active' => true],
            );

            foreach ($options as $displayOrder => $option) {
                $variant->options()->updateOrCreate(
                    ['code' => $option['code']],
                    [...$option, 'is_active' => true, 'display_order' => $displayOrder],
                );
            }
        }
    }
}
