import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, DestroyRef, effect, inject, Injectable, WritableSignal } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { baseUrl } from '../../urls';
import { Subject, timer, tap, switchMap, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


export interface DataSourceConfig<T> {
  data: Array<T>;
  dataSource: MatTableDataSource<T>;
  dataInPaginatorLength: number;
  calculatePageSizeOptions: (dataLength: number) => void;
  loading: boolean;
  cdr: ChangeDetectorRef;
  dataLoaded: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  http = inject(HttpClient)

  uploadImgeToBackend(image: any) {
    const formData = new FormData();
    formData.append('image', image)
    return this.http.post<{ url: string }>(`${baseUrl}/upload_image`, formData)
  }


  /**
 * Toggles a signal (boolean) to true for 45 seconds, then to false.
 *
 * @param sig - The signal<boolean> to toggle.
 */
  toggleSignalFor45Seconds(sig: WritableSignal<boolean | null>): void {
    sig.set(true) // Set to true immediately

    const timeoutId = setTimeout(() => {
      sig.set(false); // Set to false after 45 seconds
    }, 45000); // 45000 milliseconds = 45 seconds

    // Optionally, you can add cleanup logic if needed, e.g., to cancel the timeout.
    // This is especially useful if the signal's lifetime is tied to a component's lifecycle.
    // Example (if using Preact signals and effects):
    effect(() => {
      // If the signal is destroyed, or the component unmounts.
      // Cleanup the timeout.
      return () => {
        clearTimeout(timeoutId);
      };
    });
  }

  /**
 * Toggles a signal (boolean) to true for 45 seconds, then to false, using RxJS timer.
 *
 * @param sig - The signal<boolean> to toggle.
 */
 toggleSignalFor45SecondsRxjs(sig: WritableSignal<boolean | null>,  destroyRef?: DestroyRef): void {
  const destroy$ = new Subject<void>(); // Subject to control the observable's lifetime.

  timer(0)
    .pipe(
      tap(() => sig.set(true)),
      switchMap(() => timer(45000)),
      tap(() => sig.set(false)),
      takeUntilDestroyed(destroyRef) // Stop the observable when destroy$ emits.
    )
    .subscribe();

  // Optionally, provide a way to stop the timer and cleanup.
  // This is especially important if the signal's lifetime is tied to a component's lifecycle.
  effect(() => {
      return () => {
          destroy$.next();
          destroy$.complete();
      };
  });
}




  /**
 * Extracts the YouTube video ID from a given URL.
 *
 * This function uses a regular expression to identify and extract the 11-character
 * video ID from various YouTube URL formats, including standard YouTube URLs
 * and shortened youtu.be URLs.
 *
 * @param url The URL string to extract the video ID from.
 * @returns The YouTube video ID as a string, or null if no valid ID is found.
 */
  extractYouTubeVideoId(url: string): string {
    // Regular expression to match YouTube video IDs in various URL formats.

    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : "null";

  }

  /**
     * Validates a given URL and returns it if valid, or an empty string otherwise.
     *
     * @param {string | null} url - The URL string to validate.
     * @returns {string} - The validated URL if valid, or an empty string if invalid or null.
     */
  validateAndReturnUrl(url: string | null): string {
    if (url === null || typeof url !== 'string') {
      return "";
    }

    try {
      new URL(url); // Attempt to construct a URL object. If it fails, it's invalid.
      return url;
    } catch (error) {
      return "";
    }
  }


  /**
     * Truncates a string description to a specified maximum length, adding ellipsis if necessary.
     *
     * @param description The string description to truncate.
     * @param maxLength The maximum length of the truncated string (default: 150 characters).
     * @returns The truncated string, with "..." appended if the original description exceeded maxLength.
     */
  truncateDescription(description: string, maxLength = 150): string {
    // Check if the description length is within the allowed maximum.
    if (description.length <= maxLength) {
      // If it's within the limit, return the original description.
      return description;
    }
    // If the description exceeds the maximum length:
    // 1. Truncate the string to the maxLength.
    // 2. Trim any leading or trailing whitespace from the truncated string.
    const truncated = description.substring(0, maxLength).trim();
    // Return the truncated string with "..." appended to indicate that it's shortened.
    return truncated + '...';
  }




  /**
 * Assigns the MatPaginator to the MatTableDataSource if data is loaded and the paginator exists.
 *
 * This function conditionally assigns the provided `MatPaginator` instance to the `MatTableDataSource` instance,
 * only if the `dataLoaded` flag is true and the `paginator` instance is defined. It then triggers change
 * detection to update the view.
 *
 * @param {boolean} dataLoaded - A flag indicating whether the data has been loaded.
 * @param {MatPaginator} paginator - The MatPaginator instance to be assigned.
 * @param {MatTableDataSource<any>} dataSource - The MatTableDataSource instance to which the paginator will be assigned.
 * @param {ChangeDetectorRef} cdr - The ChangeDetectorRef instance to trigger change detection.
 *
 * @example
 * // Assuming dataLoaded is true, paginator and dataSource are initialized:
 * assignPaginator(true, myPaginator, myDataSource, myChangeDetectorRef);
 *
 * // Assuming dataLoaded is false, paginator and dataSource are initialized:
 * assignPaginator(false, myPaginator, myDataSource, myChangeDetectorRef); // No assignment occurs.
 */
  assignPaginator(dataLoaded: boolean, paginator: MatPaginator, dataSource: MatTableDataSource<any>, cdr: ChangeDetectorRef): void {
    if (dataLoaded && paginator) {
      dataSource.paginator = paginator;
      cdr.detectChanges();
    }
  }


  /**
   * Configures a MatTableDataSource with data, updates related properties, and triggers change detection.
   *
   * This function takes a set of configuration parameters, including the data to be loaded,
   * the MatTableDataSource instance, and other related properties. It populates the data source,
   * updates the paginator length, calculates page size options, and triggers change detection.
   *
   * @template T - The type of data in the data source.
   * @param {DataSourceConfig<T>} config - The configuration object containing necessary properties.
   *
   * @example
   * const config: DataSourceConfig<User> = {
   * data: users, // An array of User objects
   * dataSource: this.dataSource,
   * dataInPaginatorLength: this.dataInPaginatorLength,
   * calculatePageSizeOptions: this.calculatePageSizeOptions.bind(this),
   * loading: this.loading,
   * cdr: this.cdr,
   * dataLoaded: this.dataLoaded
   * };
   * this.configureDataSource(config);
   */
  configureDataSource<T>(config: DataSourceConfig<T>): void {
    config.dataInPaginatorLength = config.data.length;
    config.dataSource = new MatTableDataSource<T>([]);
    config.calculatePageSizeOptions(config.data.length);
    config.loading = false;
    config.dataSource.data = config.data;
    config.cdr.detectChanges();
    config.dataLoaded = true;
  }



  /**
   * Calculates and sets the page size options for a paginator based on the total data length.
   *
   * This function modifies the provided `pageSizeOptions` array to contain a set of
   * reasonable page size values, taking into account the total number of items
   * (`dataLength`). The goal is to provide a user-friendly selection of page sizes.
   *
   * @param {Array<any>} pageSizeOptions - The array to be modified, containing the page size options.
   * This array is passed by reference and will be updated
   * with the calculated options.
   * @param {number} dataLength - The total number of items in the data set.
   *
   * @example
   * let options: number[] = [];
   * calculatePageSizeOptions(options, 15);
   * console.log(options); // Output: [5, 10, 15]
   *
   * @example
   * let options: number[] = [];
   * calculatePageSizeOptions(options, 3);
   * console.log(options); // Output: [3]
   */
  calculatePageSizeOptions(pageSizeOptions: Array<any>, dataLength: number) {
    if (dataLength <= 5) {
      pageSizeOptions = [dataLength]; // If dataLength is small, only offer it as an option.
    } else if (dataLength <= 10) {
      pageSizeOptions = [5, dataLength]; // Offer 5 and the total dataLength.
    } else if (dataLength <= 25) {
      pageSizeOptions = [5, 10, dataLength]; // Offer 5, 10, and the total dataLength.
    } else {
      pageSizeOptions = [5, 10, 25, 100, dataLength]; // Offer common options and the total dataLength.
    }
  }

  constructor() { }
}
