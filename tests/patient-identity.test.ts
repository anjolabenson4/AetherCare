import { describe, it, expect, beforeEach } from "vitest"

type PatientRecord = {
  pseudonym: string,
  recordUri: string
};

type ContractResult<T> = { value?: T; error?: number };

const patientIdentityContract = {
  admin: "ST1ADMIN0000000000000000000000000000000000",
  patients: new Map<string, PatientRecord>(),

  isAdmin(caller: string): boolean {
    return caller === this.admin;
  },

  registerPatient(caller: string, pseudonym: string, recordUri: string): ContractResult<boolean> {
    if (this.patients.has(caller)) {
      return { error: 101 }; // ERR-ALREADY-REGISTERED
    }
    if (!recordUri || recordUri.length === 0) {
      return { error: 103 }; // ERR-INVALID-DATA
    }
    this.patients.set(caller, { pseudonym, recordUri });
    return { value: true };
  },

  updatePatient(caller: string, pseudonym: string, recordUri: string): ContractResult<boolean> {
    if (!this.patients.has(caller)) {
      return { error: 102 }; // ERR-NOT-REGISTERED
    }
    if (!recordUri || recordUri.length === 0) {
      return { error: 103 }; // ERR-INVALID-DATA
    }
    this.patients.set(caller, { pseudonym, recordUri });
    return { value: true };
  },

  getMyRecord(caller: string): ContractResult<PatientRecord> {
    if (!this.patients.has(caller)) {
      return { error: 102 };
    }
    return { value: this.patients.get(caller) };
  },

  getPatientByAdmin(caller: string, target: string): ContractResult<PatientRecord> {
    if (!this.isAdmin(caller)) {
      return { error: 100 };
    }
    if (!this.patients.has(target)) {
      return { error: 102 };
    }
    return { value: this.patients.get(target) };
  },

  removePatient(caller: string, target: string): ContractResult<boolean> {
    if (!this.isAdmin(caller)) {
      return { error: 100 };
    }
    if (!this.patients.has(target)) {
      return { error: 102 };
    }
    this.patients.delete(target);
    return { value: true };
  },

  transferAdmin(caller: string, newAdmin: string): ContractResult<boolean> {
    if (!this.isAdmin(caller)) {
      return { error: 100 };
    }
    this.admin = newAdmin;
    return { value: true };
  },

  isRegistered(account: string): ContractResult<boolean> {
    return { value: this.patients.has(account) };
  },

  getMyPseudonym(caller: string): ContractResult<string> {
    if (!this.patients.has(caller)) {
      return { error: 102 };
    }
    return { value: this.patients.get(caller)!.pseudonym };
  },

  getMyRecordUri(caller: string): ContractResult<string> {
    if (!this.patients.has(caller)) {
      return { error: 102 };
    }
    return { value: this.patients.get(caller)!.recordUri };
  }
};

describe("Patient Identity Contract", () => {
  const patient = "ST2PATIENT0000000000000000000000000000000000";
  const newAdmin = "ST3NEWADMIN00000000000000000000000000000000";

  beforeEach(() => {
    patientIdentityContract.admin = "ST1ADMIN0000000000000000000000000000000000";
    patientIdentityContract.patients = new Map();
  });

  it("should register a patient", () => {
    const result = patientIdentityContract.registerPatient(patient, "john_doe", "ipfs://record1");
    expect(result).toEqual({ value: true });
    expect(patientIdentityContract.patients.has(patient)).toBe(true);
  });

  it("should not allow re-registration", () => {
    patientIdentityContract.registerPatient(patient, "john_doe", "ipfs://record1");
    const result = patientIdentityContract.registerPatient(patient, "john_doe", "ipfs://record2");
    expect(result).toEqual({ error: 101 });
  });

  it("should allow patient to update their record", () => {
    patientIdentityContract.registerPatient(patient, "john_doe", "ipfs://record1");
    const result = patientIdentityContract.updatePatient(patient, "j_doe", "ipfs://updated");
    expect(result).toEqual({ value: true });
    expect(patientIdentityContract.patients.get(patient)!.recordUri).toBe("ipfs://updated");
  });

  it("should return error when unregistered user tries to update", () => {
    const result = patientIdentityContract.updatePatient(patient, "j_doe", "ipfs://updated");
    expect(result).toEqual({ error: 102 });
  });

  it("admin can view any patient record", () => {
    patientIdentityContract.registerPatient(patient, "john_doe", "ipfs://record1");
    const result = patientIdentityContract.getPatientByAdmin(patientIdentityContract.admin, patient);
    expect(result).toEqual({ value: { pseudonym: "john_doe", recordUri: "ipfs://record1" } });
  });

  it("non-admin cannot view patient record", () => {
    patientIdentityContract.registerPatient(patient, "john_doe", "ipfs://record1");
    const result = patientIdentityContract.getPatientByAdmin(patient, patient);
    expect(result).toEqual({ error: 100 });
  });

  it("admin can remove a patient record", () => {
    patientIdentityContract.registerPatient(patient, "john_doe", "ipfs://record1");
    const result = patientIdentityContract.removePatient(patientIdentityContract.admin, patient);
    expect(result).toEqual({ value: true });
    expect(patientIdentityContract.patients.has(patient)).toBe(false);
  });

  it("should transfer admin rights", () => {
    const result = patientIdentityContract.transferAdmin(patientIdentityContract.admin, newAdmin);
    expect(result).toEqual({ value: true });
    expect(patientIdentityContract.admin).toBe(newAdmin);
  });

  it("should not allow non-admin to transfer admin", () => {
    const result = patientIdentityContract.transferAdmin(patient, newAdmin);
    expect(result).toEqual({ error: 100 });
  });
});