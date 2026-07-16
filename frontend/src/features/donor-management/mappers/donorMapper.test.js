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
      donorType: 'FOUNDATION',
      fundSourceDomicile: 'DOMESTIC',
      isActive: true,
    };
    const model = fromDonorResponse(dto);
    expect(model.donorCode).toBe('DNR-001');
    expect(model.donorType).toBe('FOUNDATION');
    expect(model.donorTypeLabel).toBe('Foundation');
    expect(model.fundSourceDomicileLabel).toBe('Domestic');
    expect(model.contacts).toEqual([]);
  });

  it('builds a CreateDonorRequest with trimmed values and null blanks', () => {
    const request = toCreateDonorRequest({
      donorCode: ' DNR-002 ',
      donorName: 'Gates Foundation',
      donorType: 'FOUNDATION',
      fundSourceDomicile: 'FOREIGN',
      email: 'grants@gates.org',
      phoneNumber: '',
      website: '',
      registrationNumber: '',
      spocNameOfThePerson: 'Jane Doe',
      spocEmail: 'jane@gates.org',
      address: '',
      cityId: '',
      stateId: '4',
      countryId: '9',
      postalCode: '',
    });
    expect(request.donorCode).toBe('DNR-002');
    expect(request.phoneNumber).toBeNull();
    expect(request.cityId).toBeNull();
    expect(request.stateId).toBe(4);
    expect(request.countryId).toBe(9);
    expect(request.fundSourceDomicile).toBe('FOREIGN');
  });

  it('omits donorCode from UpdateDonorRequest', () => {
    const request = toUpdateDonorRequest({
      donorCode: 'DNR-002',
      donorName: 'Gates Foundation',
      donorType: 'FOUNDATION',
      fundSourceDomicile: 'FOREIGN',
      email: 'grants@gates.org',
      spocNameOfThePerson: 'Jane Doe',
      spocEmail: 'jane@gates.org',
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
      countryId: 2,
    };
    const formValues = toDonorFormValues(donor);
    expect(formValues.cityId).toBe(10);
    expect(formValues.stateId).toBe(5);
    expect(formValues.countryId).toBe(2);
  });
});
