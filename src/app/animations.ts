import { trigger, transition, style, animate, query } from "@angular/animations";

export const animationsArray = [
    trigger('routeAnimations', [
        transition('* <=> *', [
            style({ position: 'relative' }),
            query(':enter, :leave', [
                style({ position: 'absolute', width: '100%', top: 0, left: 0 })
            ], { optional: true }),
            query(':enter', [
                style({ opacity: 0, transform: 'translateY(5px)' }) // Subtle vertical shift
            ], { optional: true }),
            animate('22ms cubic-bezier(0.0, 0.0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' })), // Refined easing, faster
            query(':leave', [
                animate('18ms cubic-bezier(0.4, 0.0, 1, 1)', style({ opacity: 0 })) // Refined easing, faster
            ], { optional: true }),
            query(':enter', [
                style({ willChange: 'opacity, transform' }) // Performance hint
            ], { optional: true }),
            query(':leave', [
                style({ willChange: 'opacity' }) // Performance hint
            ], { optional: true })
        ])
    ])
];