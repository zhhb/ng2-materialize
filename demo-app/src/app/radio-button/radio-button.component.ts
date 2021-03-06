import { Component } from '@angular/core';

import { ROUTE_ANIMATION, ROUTE_ANIMATION_HOST } from '../app.routes.animation';
import { IPropertyRow } from '../shared/properties-table/properties-table.component';

@Component({
  selector: 'app-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss'],
  host: ROUTE_ANIMATION_HOST, // tslint:disable-line:use-host-property-decorator
  animations: [ROUTE_ANIMATION],
})
export class RadioButtonComponent {
  properties: IPropertyRow[] = [
    { name: 'id',
      mandatory: true,
      type: 'string',
      description: `Id of the input`,
    },
    { name: 'label',
      mandatory: false,
      type: 'string',
      description: `Radio button label`,
    },
    { name: 'name',
      mandatory: false,
      type: 'string',
      description: `Radio group name`,
    },
    { name: 'withGap',
      mandatory: false,
      type: 'boolean',
      description: `Show gap style radio-button`,
      defaultValue: `false`,
    },
  ];
}
