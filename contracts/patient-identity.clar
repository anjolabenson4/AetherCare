
(define-data-var admin principal tx-sender)
(define-map patients principal (tuple (pseudonym (optional (buff 34))) (record-uri (buff 128))))

;; Error codes
(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-ALREADY-REGISTERED u101)
(define-constant ERR-NOT-REGISTERED u102)
(define-constant ERR-INVALID-DATA u103)

;; Utility function to check if caller is admin
(define-private (is-admin)
  (is-eq tx-sender (var-get admin)))

;; Register a patient with optional pseudonym and off-chain record URI
(define-public (register-patient (pseudonym (optional (buff 34))) (record-uri (buff 128)))
  (begin
    (asserts! (is-none (map-get? patients tx-sender)) (err ERR-ALREADY-REGISTERED))
    (asserts! (> (len record-uri) u0) (err ERR-INVALID-DATA))
    (map-set patients tx-sender {
      pseudonym: pseudonym,
      record-uri: record-uri
    })
    (ok true)))

;; Update patient pseudonym and record URI
(define-public (update-patient (pseudonym (optional (buff 34))) (record-uri (buff 128)))
  (begin
    (asserts! (is-some (map-get? patients tx-sender)) (err ERR-NOT-REGISTERED))
    (asserts! (> (len record-uri) u0) (err ERR-INVALID-DATA))
    (map-set patients tx-sender {
      pseudonym: pseudonym,
      record-uri: record-uri
    })
    (ok true)))

;; Get a patient's record URI and pseudonym (only for the patient)
(define-read-only (get-my-record)
  (match (map-get? patients tx-sender)
    record (ok record)
    (err ERR-NOT-REGISTERED)))

;; Admin: Get a patient record by principal
(define-read-only (get-patient-by-admin (patient principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (match (map-get? patients patient)
      record (ok record)
      (err ERR-NOT-REGISTERED))))

;; Admin: Remove a patient record (soft delete)
(define-public (remove-patient (patient principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-some (map-get? patients patient)) (err ERR-NOT-REGISTERED))
    (map-delete patients patient)
    (ok true)))

;; Admin: Transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)))

;; Check if a principal is registered
(define-read-only (is-registered (account principal))
  (is-some (map-get? patients account)))

;; View own pseudonym only
(define-read-only (get-my-pseudonym)
  (match (map-get? patients tx-sender)
    record (ok (get pseudonym record))
    (err ERR-NOT-REGISTERED)))

;; View own record URI only
(define-read-only (get-my-record-uri)
  (match (map-get? patients tx-sender)
    record (ok (get record-uri record))
    (err ERR-NOT-REGISTERED)))

;; Admin: Get total number of patients (not supported in current Clarity, placeholder only)
(define-read-only (total-registered)
  (err u999))
