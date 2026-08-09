<?php

use App\Models\Branch;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\Role;
use App\Models\TableSession;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('it manages reservations and opens a branch table session', function () {
    $branch = Branch::factory()->create();
    $user = User::factory()->create([
        'branch_id' => $branch->id,
        'role_id' => Role::factory()->create()->id,
    ]);
    $table = RestaurantTable::factory()->create(['branch_id' => $branch->id]);

    $reservationResponse = $this->actingAs($user, 'api')->postJson('/api/reservations', [
        'reservation_number' => 'RES-1001',
        'reservation_date' => now()->addDay()->toDateString(),
        'start_time' => '18:00',
        'end_time' => '20:00',
        'guest_count' => 4,
        'status' => 'confirmed',
    ])->assertCreated();

    $reservation = Reservation::findOrFail($reservationResponse->json('data.id'));
    expect($reservation->branch_id)->toBe($branch->id)
        ->and($reservation->created_by)->toBe($user->id);

    $sessionResponse = $this->actingAs($user, 'api')->postJson('/api/table-sessions', [
        'reservation_id' => $reservation->id,
        'guest_count' => 4,
        'table_ids' => [$table->id],
    ])->assertCreated();

    $session = TableSession::findOrFail($sessionResponse->json('data.id'));
    expect($session->tables()->whereKey($table->id)->exists())->toBeTrue();

    $this->actingAs($user, 'api')
        ->getJson('/api/reservations?filters[status]=confirmed&per_page=10')
        ->assertOk()
        ->assertJsonPath('data.total', 1)
        ->assertJsonPath('data.data.0.reservation_number', 'RES-1001');
});
