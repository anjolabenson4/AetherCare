import { describe, it, expect, beforeEach } from "vitest"

type ClaimStatus = "pending" | "approved" | "denied"

interface Claim {
  patient: string
  insurer: string
  amount: number
  status: ClaimStatus
  notes: string
}

const mockContract = {
  admin: "ST1ADMIN0000000000000000000000000000000",
  claims: new Map<number, Claim>(),
  claimCounter: 0,

  isAdmin(caller: string): boolean {
    return caller === this.admin
  },

  fileClaim(
    caller: string,
    insurer: string,
    amount: number,
    notes: string
  ): { value?: number; error?: number } {
    if (amount <= 0) return { error: 100 }

    const claimId = ++this.claimCounter
    this.claims.set(claimId, {
      patient: caller,
      insurer,
      amount,
      status: "pending",
      notes,
    })
    return { value: claimId }
  },

  approveClaim(
    caller: string,
    claimId: number
  ): { value?: boolean; error?: number } {
    const claim = this.claims.get(claimId)
    if (!claim) return { error: 101 }
    if (caller !== claim.insurer) return { error: 102 }
    if (claim.status !== "pending") return { error: 103 }

    claim.status = "approved"
    this.claims.set(claimId, claim)
    return { value: true }
  },

  denyClaim(
    caller: string,
    claimId: number
  ): { value?: boolean; error?: number } {
    const claim = this.claims.get(claimId)
    if (!claim) return { error: 101 }
    if (caller !== claim.insurer) return { error: 102 }
    if (claim.status !== "pending") return { error: 103 }

    claim.status = "denied"
    this.claims.set(claimId, claim)
    return { value: true }
  },

  viewClaim(caller: string, claimId: number): Claim | undefined {
    return this.claims.get(claimId)
  },

  transferAdmin(caller: string, newAdmin: string): { value?: boolean; error?: number } {
    if (!this.isAdmin(caller)) return { error: 104 }
    this.admin = newAdmin
    return { value: true }
  },

  getClaimStatus(claimId: number): ClaimStatus | undefined {
    return this.claims.get(claimId)?.status
  },
}

describe("Insurance Claim Contract", () => {
  beforeEach(() => {
    mockContract.claims = new Map()
    mockContract.claimCounter = 0
    mockContract.admin = "ST1ADMIN0000000000000000000000000000000"
  })

  it("should allow a patient to file a claim", () => {
    const result = mockContract.fileClaim("ST1PATIENT", "ST1INSURER", 1000, "Routine surgery")
    expect(result.value).toBe(1)
    expect(mockContract.claims.get(1)?.amount).toBe(1000)
    expect(mockContract.claims.get(1)?.status).toBe("pending")
  })

  it("should not allow a zero or negative amount claim", () => {
    const result = mockContract.fileClaim("ST1PATIENT", "ST1INSURER", 0, "Invalid")
    expect(result).toEqual({ error: 100 })
  })

  it("should approve a claim by insurer", () => {
    const claimId = mockContract.fileClaim("ST1PATIENT", "ST1INSURER", 500, "Checkup").value!
    const result = mockContract.approveClaim("ST1INSURER", claimId)
    expect(result).toEqual({ value: true })
    expect(mockContract.getClaimStatus(claimId)).toBe("approved")
  })

  it("should not approve a claim by non-insurer", () => {
    const claimId = mockContract.fileClaim("ST1PATIENT", "ST1INSURER", 1000, "Procedure").value!
    const result = mockContract.approveClaim("ST1INTRUDER", claimId)
    expect(result).toEqual({ error: 102 })
  })

  it("should deny a claim by insurer", () => {
    const claimId = mockContract.fileClaim("ST1PATIENT", "ST1INSURER", 800, "Rejected").value!
    const result = mockContract.denyClaim("ST1INSURER", claimId)
    expect(result).toEqual({ value: true })
    expect(mockContract.getClaimStatus(claimId)).toBe("denied")
  })

  it("should not deny a non-existent claim", () => {
    const result = mockContract.denyClaim("ST1INSURER", 99)
    expect(result).toEqual({ error: 101 })
  })

  it("should not approve a denied claim", () => {
    const claimId = mockContract.fileClaim("ST1PATIENT", "ST1INSURER", 1000, "Old Claim").value!
    mockContract.denyClaim("ST1INSURER", claimId)
    const result = mockContract.approveClaim("ST1INSURER", claimId)
    expect(result).toEqual({ error: 103 })
  })

  it("should allow admin to transfer admin rights", () => {
    const result = mockContract.transferAdmin("ST1ADMIN0000000000000000000000000000000", "ST2NEWADMIN")
    expect(result).toEqual({ value: true })
    expect(mockContract.admin).toBe("ST2NEWADMIN")
  })

  it("should prevent non-admin from transferring admin", () => {
    const result = mockContract.transferAdmin("ST1NOTADMIN", "ST2NEWADMIN")
    expect(result).toEqual({ error: 104 })
  })

  it("should return correct claim data", () => {
    const claimId = mockContract.fileClaim("ST1PATIENT", "ST1INSURER", 1200, "MRI").value!
    const claim = mockContract.viewClaim("ST1PATIENT", claimId)
    expect(claim?.amount).toBe(1200)
    expect(claim?.status).toBe("pending")
  })
})
