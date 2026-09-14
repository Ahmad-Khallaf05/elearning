<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return file_get_contents($indexPath);
    }
    return view('welcome');
})->where('any', '^(?!api|sanctum|up).*$');

Route::get('/make-me-admin', function () {
    // ابحث عن المستخدم عبر إيميله
    $user = \App\Models\User::where('email', 'a.khallaf905@gmail.com')->first();
    
    if ($user) {
        // إذا كنت تستخدم عموداً عادياً في الجدول:
        $user->role = 'admin'; 
        // أو $user->is_admin = 1; (حسب تصميمك)
        
        // أما إذا كنت تستخدم حزمة Spatie للصلاحيات، استخدم:
        // $user->assignRole('admin');
        
        $user->save();
        return 'تمت ترقية الحساب إلى أدمن بنجاح!';
    }
    return 'لم يتم العثور على الحساب.';
});