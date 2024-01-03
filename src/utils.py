class IncrementingUniqueID:
    id = 0
    def generate():
        IncrementingUniqueID.id += 1
        return IncrementingUniqueID.id - 1
    

