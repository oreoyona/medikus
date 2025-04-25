import { trigger, transition, style, animate, query, group } from "@angular/animations";


export const animationsArray = [
    trigger('routeAnimations', [
      // Maintenance page has different transitions
      transition('* => MaintenancePage', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            width: '100%',
            top: 0,
            left: 0
          })
        ], { optional: true }),
        query(':enter', [
          style({
            opacity: 0,
            transform: 'translateY(20px)'
          })
        ], { optional: true }),
        query(':leave', [
          style({ opacity: 1 })
        ], { optional: true }),
        group([
          query(':leave', [
            animate('200ms ease-out', 
              style({ opacity: 0 }))
          ], { optional: true }),
          query(':enter', [
            animate('300ms ease-out', 
              style({ 
                opacity: 1,
                transform: 'translateY(0)'
              }))
          ], {optional: true})
        ])
      ]),
      
      // Normal page transitions
      transition('* <=> *', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            width: '100%',
            top: 0,
            left: 0
          })
        ], { optional: true }),
        query(':enter', [
          style({
            opacity: 0,
            transform: 'translateY(10px)'
          })
        ], {optional: true}),
        group([
          query(':leave', [
            animate('150ms ease-out', 
              style({ opacity: 0 }))
          ], { optional: true }),
          query(':enter', [
            animate('200ms 50ms ease-out', 
              style({ 
                opacity: 1,
                transform: 'translateY(0)'
              }))
          ], {optional: true})
        ])
      ])
    ])
  ];