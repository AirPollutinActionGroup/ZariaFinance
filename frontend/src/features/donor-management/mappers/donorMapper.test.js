import { describe, expect, it } from 'vitest';
import {
  fromDonorResponse,
  toCreateDonorRequest,
  toUpdateDonorRequest,
  toDonorFormValues,
} from './donorMapper.js';

describe('donorMapper', () => {
  it('preserves backend field names and adds labels', () => {
    const dto = {
      id: 1,
      donorCode: 'DNR-001',
      donorName: 'Tata Foundation',
      fundClass: 'DOMESTIC',
      status: 'ACTIVE',
    };
    const model = fromDonorResponse(dto);
    expect(model.donorCode).toBe('DNR-001');
    expect(model.fundClass).toBe('DOMESTIC');
    expect(model.fundClassLabel).toBe('Domestic');
    expect(model.statusLabel).toBe('Active');
    expect(model.contacts).toEqual([]);
  });

  it('builds a CreateDonorRequest with trimmed values and null blanks', () => {
    const request = toCreateDonorRequest({
      donorCode: ' DNR-002 ',
      donorName: 'Gates Foundation',
      donorType: 'Foundation',
      fundClass: 'INTERNATIONAL',
      email: 'grants@gates.org',
      phoneNumber: '',
      website: '',
      registrationNumber: '',
      taxId: '',
      address: '',
      cityId: '',
      stateId: '4',
      country: 'USA',
      postalCode: '',
    });
    expect(request.donorCode).toBe('DNR-002');
    expect(request.phoneNumber).toBeNull();
    expect(request.cityId).toBeNull();
    expect(request.stateId).toBe(4);
    expect(request.country).toBe('USA');
  });

  it('omits donorCode from UpdateDonorRequest', () => {
    const request = toUpdateDonorRequest({
      donorCode: 'DNR-002',
      donorName: 'Gates Foundation',
      donorType: 'Foundation',
      fundClass: 'INTERNATIONAL',
      email: 'grants@gates.org',
    });
    expect(request).not.toHaveProperty('donorCode');
    expect(request.donorName).toBe('Gates Foundation');
  });

  it('maps donor details to form values including stateId and cityId', () => {
    const donor = {
      id: 1,
      donorCode: 'DNR-001',
      donorName: 'Tata Foundation',
      cityId: 10,
      stateId: 5,
    };
    const formValues = toDonorFormValues(donor);
    expect(formValues.cityId).toBe(10);
    expect(formValues.stateId).toBe(5);
  });
});
