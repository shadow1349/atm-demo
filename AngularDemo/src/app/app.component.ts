import { Component, ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  public error: string;

  public stock = [
    {
      denomination: 100,
      amount: 10
    },
    {
      denomination: 50,
      amount: 10
    },
    {
      denomination: 20,
      amount: 10
    },
    {
      denomination: 10,
      amount: 10
    },
    {
      denomination: 5,
      amount: 10
    },
    {
      denomination: 1,
      amount: 10
    }
  ];

  public history: any[] = [];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  withdraw(amount: number) {
    const _amount = amount;
    const total = this.stock
      .map(x => x.denomination * x.amount)
      .reduce((acc, val) => acc + val);

    //Ensure sufficient funds are available
    if (amount > total) {
      this.error = 'There are insufficient funds to complete your transaction';
      return;
    }

    //Ensure that someone has entered a whole number
    if (!this.isWholeNumber(amount)) {
      this.error = 'Please enter a whole number';
      return;
    }

    //Clear any existing errors
    this.error = undefined;

    let bills: any = {};

    //Keep looking until our input amount is 0
    for (let i = 0; amount > 0; i++) {
      //start with the first item in the ATM stock array
      const denomination = this.stock[i].denomination;

      //See if the amount is less than the denomination we're working with
      if (denomination <= amount) {
        //make sure that we get a whole number
        const num = Math.floor(amount / denomination);

        //Make sure that we have enough of the denomination to dispense
        //if we don't then we'll go on to the next denomination 
        //i.e. if we have no 100s but someone requests 120 it will dispense two 50s and a 20
        if (this.stock[i].amount - num >= 0) {
          bills[denomination] = num;
          //make sure that the amount is updated so that the loop does not go on forever
          amount -= denomination * bills[denomination];
        }
      }
    }

    //Loop through the bills to update the count
    Object.keys(bills).forEach(bill => {
      const item = this.stock.find(x => x.denomination === parseInt(bill));
      item.amount -= bills[bill];
    });

    this.history.push({
      amount: _amount,
      bills: Object.keys(bills).map(x => {
        return { denomination: x, amount: bills[x] };
      })
    });
  }

  //Re-adds the array
  restock() {
    this.stock = [
      {
        denomination: 100,
        amount: 10
      },
      {
        denomination: 50,
        amount: 10
      },
      {
        denomination: 20,
        amount: 10
      },
      {
        denomination: 10,
        amount: 10
      },
      {
        denomination: 5,
        amount: 10
      },
      {
        denomination: 1,
        amount: 10
      }
    ];
  }

  //Use modulo to check that numbers are whole numbers
  private isWholeNumber(n: number) {
    return n % 1 === 0;
  }
}
