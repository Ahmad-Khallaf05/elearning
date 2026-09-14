<?php

use Illuminate\Support\Facades\Route;

// 1. المسارات المخصصة والمؤقتة يجب أن تكون في الأعلى
Route::get('/make-me-admin', function () {
    // ابحث عن المستخدم عبر إيميله
    $user = \App\Models\User::where('email', 'a.khallaf905@gmail.com')->first();
    
    if ($user) {
        $user->role = 'admin'; // تأكد أن 'role' هو اسم العمود الصحيح في جدولك
        $user->save();
        return 'تمت ترقية الحساب إلى أدمن بنجاح!';
    }
    return 'لم يتم العثور على الحساب.';
});

// 2. المسار الشامل (Catch-all) الخاص بـ React يجب أن يكون في الأسفل دائماً
Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return file_get_contents($indexPath);
    }
    return view('welcome');
})->where('any', '^(?!api|sanctum|up).*$');