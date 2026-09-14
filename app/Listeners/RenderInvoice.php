<?php

namespace App\Listeners;

use App\Events\OrderPaid;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class RenderInvoice
{
    public function handle(OrderPaid $event): void
    {
        $order = $event->order->loadMissing('student', 'course', 'student');
        $invoice = $order->invoice;
        if (! $invoice) return;
        $locale = $invoice->locale === 'ar' ? 'ar' : 'en';
        $direction = $locale === 'ar' ? 'rtl' : 'ltr';
        $labels = $locale === 'ar'
            ? ['invoice' => 'فاتورة', 'student' => 'الطالب', 'course' => 'الدورة', 'total' => 'الإجمالي']
            : ['invoice' => 'Invoice', 'student' => 'Student', 'course' => 'Course', 'total' => 'Total'];
        $html = '<!doctype html><html lang="'.$locale.'" dir="'.$direction.'"><meta charset="utf-8"><style>body{font-family:DejaVu Sans,sans-serif;padding:40px}h1{color:#167d74}</style><h1>'.$labels['invoice'].' '.$invoice->number.'</h1><p>'.$labels['student'].': '.e($order->student->name).'</p><p>'.$labels['course'].': '.e($order->course->title).'</p><p>'.$labels['total'].': '.number_format((float) $order->total_amount, 2).' '.e($order->currency).'</p></html>';
        $path = 'invoices/'.$invoice->number.'.pdf';
        Storage::disk('local')->put($path, Pdf::loadHTML($html)->output());
        $invoice->update(['file_path' => $path]);
    }
}
