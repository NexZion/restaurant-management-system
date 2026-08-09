<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Models\Printer;
use Illuminate\Http\JsonResponse;

class PrinterOperationController extends Controller
{
    public function test(IndexFilterRequest $request, Printer $printer): JsonResponse
    {
        abort_unless($printer->branch_id === $request->user()->branch_id, 404);
        if (! $printer->is_active) {
            return response()->json(['success' => false, 'message' => 'Printer is inactive.'], 409);
        }
        if ($printer->type !== 'network') {
            return response()->json(['success' => true, 'message' => 'Printer configuration is valid; device-level testing is required for this connection type.']);
        }
        $socket = @fsockopen($printer->ip_address, $printer->port ?? 9100, $errorCode, $errorMessage, 2);
        if (! $socket) {
            return response()->json(['success' => false, 'message' => "Printer connection failed: {$errorMessage}.", 'error_code' => $errorCode], 422);
        }
        fclose($socket);

        return response()->json(['success' => true, 'message' => 'Printer connection succeeded.']);
    }
}
