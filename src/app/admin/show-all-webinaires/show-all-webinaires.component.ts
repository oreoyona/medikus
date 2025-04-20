import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LoadingSpinnerComponent } from '../../common/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { User } from 'ckeditor5-premium-features';
import { HelpersService } from '../../common/services/helpers.service';
import { UserService } from '../users/user.service';
import { WebinaireService } from '../create-webinaire/webinaire.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { Webinaire } from '../../common/infercaces';
import { FormatDatePipe } from "../../common/pipes/format-date.pipe";

@Component({
  selector: 'app-show-all-webinaires',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    LoadingSpinnerComponent,
    MatPaginatorModule,
    MatCardModule,
    FormatDatePipe
], templateUrl: './show-all-webinaires.component.html',
  styleUrl: './show-all-webinaires.component.scss'
})
export class ShowAllWebinairesComponent implements OnInit {

  ngOnInit(): void {

    this.ws.getWebinaires()
      .pipe(
        catchError(
          (err) => {
            this.loading = false
            this.message.set("Une erreur est survenue. Veuillez revenir plus tard")
            return of(err)
          }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
        this.loading = false;
        const webinaires = res.data as Webinaire[]


        this.dataInPaginatorLength = webinaires.length
        this.dataSource = new MatTableDataSource<Webinaire>([]);
        this.calculatePageSizeOptions(webinaires.length)
        this.dataSource.data = webinaires
        this.dataLoaded = true
        this.hs.assignPaginator(this.dataLoaded, this.paginator, this.dataSource, this.cdr)

      })

  }


  @ViewChild('paginator') paginator!: MatPaginator;
  private cdr = inject(ChangeDetectorRef);

  router = inject(Router)
  destroyRef = inject(DestroyRef)
  hs = inject(HelpersService)
  ws = inject(WebinaireService)


  loading = true;
  message: WritableSignal<string | null> = signal(null);
  dataSource!: MatTableDataSource<Webinaire>;
  pageSizeOptions: number[] = [];
  dataInPaginatorLength!: number;
  displayedColumns: string[] = ['id', 'titre', 'date', 'instructeur', 'action'];
  dataLoaded = false;



  public goTo(id: any) {
    const numId = Number(id);
    
    this.router.navigate(['admin', { outlets: { admin: ['webinaires', `${numId}`] } }]);
  }

  private calculatePageSizeOptions(dataLength: number) {
    if (dataLength <= 5) {
      this.pageSizeOptions = [dataLength];
    } else if (dataLength <= 10) {
      this.pageSizeOptions = [5, dataLength];
    } else if (dataLength <= 25) {
      this.pageSizeOptions = [5, 10, dataLength];
    } else {
      this.pageSizeOptions = [5, 10, 25, 100, dataLength];
    }
  }


}
