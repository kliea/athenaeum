<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use App\Models\AuditLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller
{
    /**
     * Record attendance for a user
     */
    public function record(Request $request): JsonResponse
    {
        try {
            // Validate input
            $validated = $request->validate([
                'idNumber' => 'required|string|min:1',
            ]);

            $trimmedId = trim($validated['idNumber']);

            // Find an ACTIVE user by ID number, email, or username
            $user = User::where('is_active', true)
                ->where(function ($query) use ($trimmedId) {
                    $query->where('id_number', $trimmedId)
                          ->orWhere('email', $trimmedId)
                          ->orWhere('username', $trimmedId);
                })
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Active user not found. Please check the ID.',
                    'error' => 'USER_NOT_FOUND_OR_INACTIVE',
                ], 404);
            }

            $today = Carbon::today();

            // Check if user has an active check-in for today
            $todayRecord = AttendanceLog::where('user_id', $user->id)
                ->whereDate('date', $today)
                ->orderBy('check_in_time', 'desc')
                ->first();

            $action = 'check_in';

            if (!$todayRecord || $todayRecord->status === 'checked_out') {
                // No record today or last record is checked out - create new check-in
                AttendanceLog::create([
                    'user_id' => $user->id,
                    'check_in_time' => Carbon::now(),
                    'status' => 'checked_in',
                    'date' => $today,
                ]);
                $action = 'check_in';
            } else {
                // User is checking out
                $todayRecord->update([
                    'check_out_time' => Carbon::now(),
                    'status' => 'checked_out',
                ]);
                $action = 'check_out';
            }

            // Log the action for audit purposes
            $this->logAuditTrail($user->id, $action, $trimmedId);

            // Return a sanitized response
            return response()->json([
                'success' => true,
                'message' => ucfirst($action) . ' recorded successfully.',
                'action' => $action,
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid input',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Attendance recording error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to log attendance. Please try again.',
                'error' => 'SERVER_ERROR',
            ], 500);
        }
    }

    /**
     * Get attendance summary for a user
     */
    public function summary(Request $request, User $user): JsonResponse
    {
        try {
            $validated = $request->validate([
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
            ]);

            $query = AttendanceLog::where('user_id', $user->id);

            if ($validated['start_date'] ?? null) {
                $query->whereDate('date', '>=', $validated['start_date']);
            }

            if ($validated['end_date'] ?? null) {
                $query->whereDate('date', '<=', $validated['end_date']);
            }

            $records = $query->orderBy('date', 'desc')
                ->orderBy('check_in_time', 'desc')
                ->get()
                ->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'user_id' => $record->user_id,
                        'check_in_time' => $record->check_in_time,
                        'check_out_time' => $record->check_out_time,
                        'status' => $record->status,
                        'date' => $record->date,
                        'hours_logged' => $record->hours_logged,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $records,
                'count' => $records->count(),
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error fetching attendance summary: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance records.',
            ], 500);
        }
    }

    /**
     * Get today's attendance for a user
     */
    public function today(User $user): JsonResponse
    {
        $record = AttendanceLog::where('user_id', $user->id)
            ->today()
            ->latest('check_in_time')
            ->first();

        return response()->json([
            'success' => true,
            'data' => $record ? [
                'id' => $record->id,
                'status' => $record->status,
                'check_in_time' => $record->check_in_time,
                'check_out_time' => $record->check_out_time,
                'hours_logged' => $record->hours_logged,
            ] : null,
        ]);
    }

    /**
     * Log audit trail
     */
    private function logAuditTrail(int $userId, string $action, string $identifier): void
    {
        try {
            AuditLog::create([
                'user_id' => $userId,
                'action' => $action,
                'identifier' => $identifier,
                'timestamp' => Carbon::now(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error logging audit trail: ' . $e->getMessage());
        }
    }
};
