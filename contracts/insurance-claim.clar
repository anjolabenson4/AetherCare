;; Insurance Claim Smart Contract for AetherCare

(define-data-var admin principal tx-sender)

(define-map insurance-policies principal
  {
    policy-id: (buff 32),
    coverage: uint,
    premium: uint,
    valid-until: uint,
    active: bool
  }
)

(define-map claims (tuple (user principal) (claim-id (buff 32)))
  {
    policy-id: (buff 32),
    amount: uint,
    description: (buff 100),
    submitted-at: uint,
    approved: bool,
    resolved: bool
  }
)

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-POLICY-NOT-FOUND u101)
(define-constant ERR-CLAIM-NOT-FOUND u102)
(define-constant ERR-NOT-ACTIVE u103)
(define-constant ERR-DUPLICATE u104)
(define-constant ERR-COVERAGE-EXCEEDED u105)

;; Check if sender is admin
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; Register a new insurance policy
(define-public (register-policy (user principal) (policy-id (buff 32)) (coverage uint) (premium uint) (valid-until uint))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (map-set insurance-policies user {
      policy-id: policy-id,
      coverage: coverage,
      premium: premium,
      valid-until: valid-until,
      active: true
    })
    (ok true)
  )
)

;; Disable an insurance policy
(define-public (deactivate-policy (user principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (let ((policy (map-get? insurance-policies user)))
      (match policy
        value (begin
          (map-set insurance-policies user (merge value { active: false }))
          (ok true)
        )
        none (err ERR-POLICY-NOT-FOUND)
      )
    )
  )
)

;; Submit a new claim
(define-public (submit-claim (claim-id (buff 32)) (policy-id (buff 32)) (amount uint) (description (buff 100)))
  (let ((policy (map-get? insurance-policies tx-sender)))
    (match policy
      value
        (begin
          (asserts! (is-eq (get policy-id value) policy-id) (err ERR-POLICY-NOT-FOUND))
          (asserts! (get active value) (err ERR-NOT-ACTIVE))
          (asserts! (<= amount (get coverage value)) (err ERR-COVERAGE-EXCEEDED))
          (asserts! (is-none (map-get? claims { user: tx-sender, claim-id: claim-id })) (err ERR-DUPLICATE))
          (map-set claims { user: tx-sender, claim-id: claim-id } {
            policy-id: policy-id,
            amount: amount,
            description: description,
            submitted-at: block-height,
            approved: false,
            resolved: false
          })
          (ok true)
        )
      none (err ERR-POLICY-NOT-FOUND)
    )
  )
)

;; Approve a claim
(define-public (approve-claim (user principal) (claim-id (buff 32)))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (let ((claim (map-get? claims { user: user, claim-id: claim-id })))
      (match claim
        value (begin
          (map-set claims { user: user, claim-id: claim-id } (merge value {
            approved: true,
            resolved: true
          }))
          (ok true)
        )
        none (err ERR-CLAIM-NOT-FOUND)
      )
    )
  )
)

;; Reject a claim
(define-public (reject-claim (user principal) (claim-id (buff 32)))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (let ((claim (map-get? claims { user: user, claim-id: claim-id })))
      (match claim
        value (begin
          (map-set claims { user: user, claim-id: claim-id } (merge value {
            approved: false,
            resolved: true
          }))
          (ok true)
        )
        none (err ERR-CLAIM-NOT-FOUND)
      )
    )
  )
)

;; Read-only function to check policy
(define-read-only (get-policy (user principal))
  (map-get? insurance-policies user)
)

;; Read-only function to check claim
(define-read-only (get-claim (user principal) (claim-id (buff 32)))
  (map-get? claims { user: user, claim-id: claim-id })
)

;; Transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)
  )
)
